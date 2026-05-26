import { INestApplication } from '@nestjs/common'
import { NestFactory, Reflector } from '@nestjs/core'
import {
	FastifyAdapter,
	NestFastifyApplication,
} from '@nestjs/platform-fastify'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { apiReference } from '@scalar/nestjs-api-reference'
import {
	cleanupOpenApiDoc,
	ZodSerializerInterceptor,
	ZodValidationPipe,
} from 'nestjs-zod'
import { AppModule } from './app.module'
import { GlobalExceptionFilter } from './common/filters/global-exception.filter'
import { ConfigService } from './components/config/config.service'
import { ErrorsInterceptor } from './common/interceptors/error.interceptor'
import { TransformInterceptor } from './common/interceptors/transform.interceptor'
import { Logger } from 'nestjs-pino'
import { DatabaseService } from './components/database/database.service'
import { CacheService } from './components/cache/cache.service'
import { ScheduleService } from './application/schedule/schedule.service'
import { buildingTable } from './db/schema'
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import Redis from 'ioredis'
import {
	IS_UPDATE_IN_PROGRESS_KEY,
	UPDATE_STATUS,
} from './common/constants/health-status'

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

	SwaggerModule.setup('api', app, cleanupOpenApiDoc(document))

	app.use(
		'/api',
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
	const app = await NestFactory.create<NestFastifyApplication>(
		AppModule,
		new FastifyAdapter(),
		{
			bufferLogs: true,
			cors: {
				credentials: true,
				methods: ['GET', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
				maxAge: 86_400,
			},
		},
	)

	useSwagger(app)

	const configService = app.get(ConfigService)
	const { port } = configService.get('server')

	app.useLogger(app.get(Logger))
	app.useGlobalFilters(new GlobalExceptionFilter())
	app.useGlobalInterceptors(new ZodSerializerInterceptor(app.get(Reflector)))
	app.useGlobalInterceptors(new ErrorsInterceptor())
	app.useGlobalInterceptors(new TransformInterceptor())
	app.useGlobalPipes(new ZodValidationPipe())

	const db = app.get(DatabaseService).get()
	const cache = app.get(CacheService).get()
	const scheduleService = app.get(ScheduleService)

	await app.listen(port)

	const [isEmpty, isUpdating] = await Promise.all([
		isDbEmpty(db),
		isScheduleUpdating(cache),
	])

	if (isEmpty || isUpdating) {
		await scheduleService.processSchedule()
	}
}

void bootstrap()
