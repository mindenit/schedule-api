import type { Logger as DrizzleLogger } from 'drizzle-orm'
import { LoggerService } from '../logger.service'

export const createDrizzleLogger = (logger: LoggerService): DrizzleLogger => ({
	logQuery(query, params) {
		logger.log('db.query', { query, params })
	},
})
