import z from 'zod'

const PortSchema = z.number().int().min(1000).max(9999)

const ServerConfigSchema = z.object({
	port: PortSchema,
})

const DbConfigSchema = z.object({
	user: z.string().nonempty(),
	password: z.string().nonempty(),
	host: z.string(),
	port: z.number().int().min(1000).max(9999),
	database: z.string().nonempty(),
})

const CacheConfigSchema = z.object({
	user: z.string().nonempty(),
	host: z.string(),
	port: PortSchema,
	password: z.string().nonempty(),
})

const IntegrationConfigSchema = z.record(
	z.string(),
	z.object({ enabled: z.boolean() }).and(z.record(z.string(), z.unknown())),
)

const WebhooksConfigSchema = z.object({
	enabled: z.boolean(),
	webhookUrl: z.url(),
})

const ConfigSchema = z.object({
	server: ServerConfigSchema,
	db: DbConfigSchema,
	cache: CacheConfigSchema,
	integrations: IntegrationConfigSchema,
	webhooks: WebhooksConfigSchema,
})

type Config = z.infer<typeof ConfigSchema>

export { ConfigSchema }
export type { Config }
