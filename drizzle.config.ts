import { defineConfig } from 'drizzle-kit'

export default defineConfig({
	schema: './src/db/dist/schema/*.js',
	dialect: 'postgresql',
	out: './migrations',
	casing: 'snake_case',
	dbCredentials: {
		host: process.env.POSTGRES_HOST!,
		port: +process.env.POSTGRES_PORT!,
		user: process.env.POSTGRES_USER!,
		password: process.env.POSTGRES_PASSWORD!,
		database: process.env.POSTGRES_DB!,
		ssl: false,
	},
})
