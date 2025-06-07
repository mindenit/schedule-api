import type {
	CommonDependencies,
	ExternalDependencies,
} from '@/core/types/deps.js'
import { asFunction, type NameAndRegistrationPair } from 'awilix'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { getConfig } from './config.js'
import { Redis } from 'ioredis'
import { relations } from '@/db/relations.js'

export const resolveCommonDiConfig = (
	dependencies: ExternalDependencies,
): NameAndRegistrationPair<CommonDependencies> => ({
	db: asFunction(
		({ config }: CommonDependencies) => {
			const { user, password, host, port, database } = config.db

			const queryClient = postgres({
				username: user,
				password,
				host,
				port,
				database,
			})

			return {
				client: drizzle(queryClient, {
					relations,
					logger: true,
					casing: 'snake_case',
				}),
				connection: queryClient,
			}
		},
		{
			dispose: ({ connection }) => {
				connection.end()
			},
		},
	).singleton(),
	cache: asFunction(
		({ config }: CommonDependencies) => {
			const { user, password, port, host } = config.cache

			const cache = new Redis({
				port,
				host,
				username: user,
				password: password,
			})

			return cache
		},
		{
			dispose: (redis) => {
				redis.disconnect()
			},
		},
	).singleton(),
	logger: asFunction(() => dependencies.app.log).singleton(),
	config: asFunction(() => getConfig()).singleton(),
})
