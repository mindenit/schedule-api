import z from 'zod'

const PortSchema = z.coerce.number().int().min(1000).max(9999)

const EnvSchema = z.object({
	PORT: PortSchema,

	POSTGRES_USER: z.string().nonempty(),
	POSTGRES_PASSWORD: z.string().nonempty(),
	POSTGRES_HOST: z.string().nonempty(),
	POSTGRES_PORT: PortSchema,
	POSTGRES_DB: z.string().nonempty(),

	CACHE_USER: z.string().nonempty(),
	CACHE_PASSWORD: z.string().nonempty(),
	CACHE_HOST: z.string().nonempty(),
	CACHE_PORT: PortSchema,

	CIST_CLIENT_ID: z.string().nonempty(),
	MOODLE_BASE_URL: z.url().optional(),
	PROXY_BASE_URL: z.url().optional(),

	WEBHOOKS_ENABLED: z.stringbool().default(false),
	DISCORD_WEBHOOK_URL: z.url(),
})

type Env = z.infer<typeof EnvSchema>

/*
 * Maps validated environment variables to the grouped application config.
 * @param {Env} env - Validated environment variables
 * @returns {Config} Grouped config consumed across the app
 */
const toConfig = (env: Env) => ({
	server: {
		port: env.PORT,
	},
	db: {
		user: env.POSTGRES_USER,
		password: env.POSTGRES_PASSWORD,
		host: env.POSTGRES_HOST,
		port: env.POSTGRES_PORT,
		database: env.POSTGRES_DB,
	},
	cache: {
		user: env.CACHE_USER,
		password: env.CACHE_PASSWORD,
		host: env.CACHE_HOST,
		port: env.CACHE_PORT,
	},
	integrations: {
		cist: { clientId: env.CIST_CLIENT_ID },
		moodle: { baseUrl: env.MOODLE_BASE_URL },
		proxy: { baseUrl: env.PROXY_BASE_URL },
	},
	webhooks: {
		enabled: env.WEBHOOKS_ENABLED,
		webhookUrl: env.DISCORD_WEBHOOK_URL,
	},
})

type Config = ReturnType<typeof toConfig>

export { EnvSchema, toConfig }
export type { Config, Env }
