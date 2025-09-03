import type { AppInstance } from '@/core/types/common.js'
import { env } from '@/env.js'
import { registerDependencies } from '@/infrastructure/parentDiConfig.js'
import { diContainer, fastifyAwilixPlugin } from '@fastify/awilix'
import fastifyCookie from '@fastify/cookie'
import fastifyCors from '@fastify/cors'
import fastifyHelmet from '@fastify/helmet'
import fastifyRateLimit from '@fastify/rate-limit'
import fastifySchedule from '@fastify/schedule'
import fastifySession from '@fastify/session'
import fastifySwagger from '@fastify/swagger'
import scalarApiReference from '@scalar/fastify-api-reference'
import fastify from 'fastify'
import {
	createJsonSchemaTransform,
	serializerCompiler,
	validatorCompiler,
	type ZodTypeProvider,
} from 'fastify-type-provider-zod'
import qs from 'qs'
import { AsyncTask, CronJob } from 'toad-scheduler'
import { getRoutes } from './modules/index.js'
import { CLIENT_COOKIE_NAME } from './modules/links/constants/index.js'
import { cistPostmanJob } from './modules/schedule/jobs/postman.js'
import { customLogtoAdapter } from './plugins/auth/index.js'

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
			// origin: '*', // TODO: Change to your origin(s)
			// origin: ['https://id.mindenit.org/', 'https://sh.mindenit.org/'],
			// credentials: true,
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
				components: {
					securitySchemes: {
						CookieAuth: {
							type: 'apiKey',
							in: 'cookie',
							name: CLIENT_COOKIE_NAME,
						},
					},
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

		// this.app.register(fastifyLogto, {
		// 	appId: env.LOGTO_APP_ID,
		// 	appSecret: env.LOGTO_APP_SECRET,
		// 	endpoint: env.LOGTO_ENDPOINT,
		// 	baseUrl: 'http://127.0.0.1:8080',
		// 	// @ts-expect-error missing types
		// 	cookieSecret: 'your-cookie-secret',
		// 	createAuthRoutes: true,
		// 	authRoutesPrefix: 'api/auth',
		// })

		await this.app.register(fastifyCookie, {
			secret: env.COOKIE_SECRET,
			hook: 'preHandler',
		})

		await this.app.register(fastifySession, {
			secret: 'a secret with minimum length of 32 characters',
		})

		await this.app.register(customLogtoAdapter, {
			appId: env.LOGTO_APP_ID,
			appSecret: env.LOGTO_APP_SECRET,
			endpoint: env.LOGTO_ENDPOINT,
			baseUrl: 'http://127.0.0.1:8080',
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
		const { routes } = getRoutes(this.app)

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
		const task = new AsyncTask('cist-postman', async () => {
			await cistPostmanJob(this.app)
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

			const { job } = await this.registerPeriodicJob()

			await this.app.ready().then(() => {
				this.app.scheduler.addCronJob(job)
			})

			return this.app
		} catch (e: unknown) {
			this.app.log.error('Error while initializing app ', e)

			throw e
		}
	}
}
