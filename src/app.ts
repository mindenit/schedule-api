import type { AppInstance } from '@/core/types/common.js'
import { env } from '@/env.js'
import { registerDependencies } from '@/infrastructure/parentDiConfig.js'
import { diContainer, fastifyAwilixPlugin } from '@fastify/awilix'
import fastifyCookie from '@fastify/cookie'
import fastifyCors from '@fastify/cors'
import fastifyHelmet from '@fastify/helmet'
import fastifyRateLimit from '@fastify/rate-limit'
import fastifySwagger from '@fastify/swagger'
import fastify from 'fastify'
import {
	createJsonSchemaTransform,
	serializerCompiler,
	validatorCompiler,
	type ZodTypeProvider,
} from 'fastify-type-provider-zod'
import { getRoutes } from './modules/index.js'
import scalarApiReference from '@scalar/fastify-api-reference'
import { AsyncTask, CronJob } from 'toad-scheduler'
import { SCHEDULE_TYPE } from './core/constants/parsers.js'
import { delay, isDbEmpty } from './core/utils/index.js'
import fastifySchedule from '@fastify/schedule'
import qs from 'qs'

export class App {
	private readonly app: AppInstance

	constructor() {
		this.app = fastify({
			querystringParser: qs.parse,
			logger: {
				transport: {
					target: 'pino-pretty',
					options: {
						colorize: true,
					},
				},
			},
		})
	}

	private async registerPlugins(): Promise<void> {
		this.app.setValidatorCompiler(validatorCompiler)
		this.app.setSerializerCompiler(serializerCompiler)

		await this.app.register(fastifyCors, {
			origin: '*', // TODO: Change to your origin(s)
			// credentials: true, // remember origin shouldn't be *, otherwise it won't work
			methods: ['GET', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
		})

		await this.app.register(fastifyHelmet, {
			contentSecurityPolicy: {
				directives: {
					'script-src': [
						"'self'",
						"'sha256-rEoKEh+ixY/s4bkl+CNhaCR+cWdAJ6YviVnKiRKmB9o='",
					],
				},
			},
		})

		await this.app.register(fastifySwagger, {
			transform: createJsonSchemaTransform({
				skipList: [
					'/documentation',
					'/documentation/initOAuth',
					'/documentation/json',
					'/documentation/uiConfig',
					'/documentation/yaml',
					'/documentation/*',
					'/documentation/static/*',
					'*',
				],
			}),
			openapi: {
				info: {
					title: 'Mindenit Schedule API',
					description: 'API for Mindenit Schedule application',
					version: '0.0.0',
				},
			},
		})

		await this.app.register(scalarApiReference, {
			routePrefix: '/api',
		})

		await this.app.register(fastifyAwilixPlugin, {
			disposeOnClose: true,
			asyncDispose: true,
			asyncInit: true,
			eagerInject: true,
			disposeOnResponse: true,
		})

		await this.app.register(fastifyCookie, {
			secret: env.COOKIE_SECRET,
			hook: 'preHandler',
		})

		await this.app.register(fastifyRateLimit, {
			max: 100,
			ban: 150,
			timeWindow: 15 * 1000,
			allowList: ['127.0.0.1'],
		})

		this.app.register(fastifySchedule)

		registerDependencies(diContainer, { app: this.app })
	}

	private registerRoutes(): void {
		const { routes } = getRoutes()

		this.app.register(
			(instance, _, done) => {
				for (const route of routes) {
					instance.withTypeProvider<ZodTypeProvider>().route(route)
				}

				done()
			},
			{ prefix: '/api' },
		)
	}

	private async registerPeriodicJob() {
		const {
			auditoriumsProcessor,
			groupsProcessor,
			eventsProcessor,
			teachersProcessor,
			logger,
		} = this.app.diContainer.cradle

		const task = new AsyncTask('cist-postman', async () => {
			logger.info('Start CIST Postman')

			const [auditoriums, groups, teachers] = await Promise.all([
				auditoriumsProcessor.process(),
				groupsProcessor.process(),
				teachersProcessor.process(),
			])

			if (!auditoriums || !groups || !teachers) {
				return
			}

			logger.info('Start filling events')

			for (const group of groups) {
				await eventsProcessor.process(group.id, SCHEDULE_TYPE.GROUP)

				delay(3000)
			}

			logger.info('Job completed sucessfully')
		})

		return {
			job: new CronJob({ cronExpression: '0 */12 * * *' }, task, {
				id: 'cist-postman',
				preventOverrun: true,
			}),
			task,
		}
	}

	async initialize(): Promise<AppInstance> {
		try {
			await this.registerPlugins()

			this.app.after(() => {
				this.registerRoutes()
			})

			const { job, task } = await this.registerPeriodicJob()

			await this.app.ready().then(() => {
				this.app.scheduler.addCronJob(job)
			})

			if (await isDbEmpty(this.app.diContainer.cradle.db.client)) {
				await task.executeAsync()
			}

			return this.app
		} catch (e: unknown) {
			this.app.log.error('Error while initializing app ', e)

			throw e
		}
	}
}
