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

interface Config {
	db: DbConfig
	cache: CacheConfig
	proxy: ProxyConfig
}

export type { Config, DbConfig, CacheConfig, ProxyConfig }
