interface DbConfig {
	user: string
	password: string
	host: string
	port: number
	database: string
}

interface CacheConfig {
	user: string
	host: string
	port: number
	password: string
}

interface ProxyConfig {
	baseUrl: string
}

interface IntegrationConfig {
	discordWebhookUrl: string
}

interface MoodleConfig {
	baseUrl: string
}

interface Config {
	db: DbConfig
	cache: CacheConfig
	proxy: ProxyConfig
	integration: IntegrationConfig
	moodle: MoodleConfig
}

export type {
	Config,
	DbConfig,
	CacheConfig,
	ProxyConfig,
	IntegrationConfig,
	MoodleConfig,
}
