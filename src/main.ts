import 'dotenv/config'

import { INestApplication } from '@nestjs/common'
import { NestFactory, Reflector } from '@nestjs/core'
import {
	FastifyAdapter,
	NestFastifyApplication,
} from '@nestjs/platform-fastify'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { apiReference } from '@scalar/nestjs-api-reference'
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import Redis from 'ioredis'
import { ZodSerializerInterceptor, ZodValidationPipe } from 'nestjs-zod'
import qs from 'qs'

import { AppModule } from './app.module'
import { ScheduleService } from './application/schedule/schedule.service'
import {
	IS_UPDATE_IN_PROGRESS_KEY,
	UPDATE_STATUS,
} from './common/constants/health-status'
import { GlobalExceptionFilter } from './common/filters/global-exception.filter'
import { ErrorsInterceptor } from './common/interceptors/error.interceptor'
import { TransformInterceptor } from './common/interceptors/transform.interceptor'
import { CacheService } from './components/cache/cache.service'
import { ConfigService } from './components/config/config.service'
import { DatabaseService } from './components/database/database.service'
import { LoggerService } from './components/logger/logger.service'
import { buildingTable } from './db/schema'

const useSwagger = (app: INestApplication) => {
	const config = new DocumentBuilder()
		.setTitle('Mindenit Hub API')
		.setDescription('API for Mindenit Hub application')
		.setVersion('1.0.0')
		.addTag('API')
		.addSecurity('access-token', {
			type: 'apiKey',
			in: 'cookie',
			name: 'schedule-client-id',
		})
		.addSecurityRequirements('access-token')
		.build()

	const document = SwaggerModule.createDocument(app, config)

	app.use(
		'/api/docs',
		apiReference({
			content: document,
			withFastify: true,
			theme: 'deepSpace',
			metaData: {
				title: 'Mindenit Hub API Reference',
				description: '',
			},
		}),
	)
}

const isDbEmpty = async (db: PostgresJsDatabase): Promise<boolean> => {
	const rows = await db.select().from(buildingTable).limit(1)

	return rows.length === 0
}

const isScheduleUpdating = async (cache: Redis): Promise<boolean> => {
	const status = await cache.get(IS_UPDATE_IN_PROGRESS_KEY)

	if (!status) {
		return false
	}

	return status === UPDATE_STATUS.IN_PROGRESS
}

async function bootstrap() {
	const logger = new LoggerService()

	const app = await NestFactory.create<NestFastifyApplication>(
		AppModule,
		new FastifyAdapter({
			// Restore nested querystring parsing (e.g. `?filters[teachers]=1,2`)
			// for schedule route filters. The schedule query schema nests filter
			// fields under a `filters` key, which Fastify's default parser cannot
			// build. This matches the pre-NestJS Fastify configuration.
			querystringParser: (str) => qs.parse(str),
		}),
		{
			logger,
			bufferLogs: true,
			cors: {
				credentials: true,
				methods: ['GET', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
				maxAge: 86_400,
			},
		},
	)

	app.setGlobalPrefix('api')

	useSwagger(app)

	const configService = app.get(ConfigService)
	const { port } = configService.get('server')

	app.useGlobalFilters(new GlobalExceptionFilter())
	// Interceptor registration order matters: NestJS runs interceptors in reverse
	// registration order on the response path (last registered = innermost).
	// TransformInterceptor must wrap the raw value into {success,data,error} BEFORE
	// ZodSerializerInterceptor validates it against the envelope DTO schema.
	app.useGlobalInterceptors(new ZodSerializerInterceptor(app.get(Reflector)))
	app.useGlobalInterceptors(new ErrorsInterceptor())
	app.useGlobalInterceptors(new TransformInterceptor())
	app.useGlobalPipes(new ZodValidationPipe())

	const db = app.get(DatabaseService).get()
	const cache = app.get(CacheService).get()
	const scheduleService = app.get(ScheduleService)

	await app.listen(port, '0.0.0.0')

	const [isEmpty, isUpdating] = await Promise.all([
		isDbEmpty(db),
		isScheduleUpdating(cache),
	])

	if (isEmpty || isUpdating) {
		// Fire-and-forget: the listener is already accepting traffic.
		// Seeding runs in the background so Caddy / the reverse proxy never
		// sees the server as unavailable during a potentially long seed run.
		setImmediate(() => {
			scheduleService.processSchedule().catch((err: unknown) => {
				logger.error('bootstrap-seed-failed', { err })
			})
		})
	}
}

void bootstrap()
