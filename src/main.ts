import 'dotenv/config'

import fastifyCors from '@fastify/cors'
import fastifyRateLimit from '@fastify/rate-limit'
import { HttpStatus, INestApplication } from '@nestjs/common'
import { NestFactory, Reflector } from '@nestjs/core'
import {
	FastifyAdapter,
	NestFastifyApplication,
} from '@nestjs/platform-fastify'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { apiReference } from '@scalar/nestjs-api-reference'
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { FastifyRequest } from 'fastify'
import Redis from 'ioredis'
import { ZodSerializerInterceptor, ZodValidationPipe } from 'nestjs-zod'

import { AppModule } from './app.module'
import { ScheduleService } from './application/schedule/schedule.service'
import {
	IS_UPDATE_IN_PROGRESS_KEY,
	UPDATE_STATUS,
} from './common/constants/health-status'
import { LinksErrorCodes } from './common/exceptions/error-codes'
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
		new FastifyAdapter(),
		{
			logger,
			bufferLogs: true,
		},
	)

	app.setGlobalPrefix('api')

	const configService = app.get(ConfigService)
	const { port } = configService.get('server')

	// All routes are public — no credentials, no origin allowlist needed.
	// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument
	await app.register(fastifyCors as any, {
		origin: '*',
		credentials: false,
		methods: ['GET', 'POST', 'OPTIONS'],
		maxAge: 86_400,
	})

	// Rate-limit bundle creation: 10 POST /api/sharable-links per hour per IP.
	// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument
	await app.register(fastifyRateLimit as any, {
		max: 10,
		timeWindow: '1 hour',
		keyGenerator: (req: FastifyRequest) => req.ip,
		// Apply only to POST /api/sharable-links
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		hook: 'preHandler' as any,

		skipOnError: false,
		errorResponseBuilder: () => ({
			success: false,
			error: {
				code: LinksErrorCodes.SHARABLE_LINKS_RATE_LIMIT_EXCEEDED,
				message: 'You may create at most 10 sharable links per hour',
				statusCode: HttpStatus.TOO_MANY_REQUESTS,
			},
		}),
	})

	useSwagger(app)

	app.useGlobalFilters(new GlobalExceptionFilter())
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
