import { Injectable } from '@nestjs/common'
import { drizzle, PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

import { ConfigService } from '../config/config.service'
import { createDrizzleLogger } from '../logger/helpers/drizzle.helper'
import { LoggerService } from '../logger/logger.service'

@Injectable()
export class DatabaseService {
	private database: PostgresJsDatabase

	constructor(
		private readonly configService: ConfigService,
		private readonly logger: LoggerService,
	) {
		const { user, password, host, port, database } =
			this.configService.get('db')

		const queryClient = postgres({
			username: user,
			password,
			host,
			port,
			database,
		})

		this.database = drizzle(queryClient, {
			casing: 'snake_case',
			logger: createDrizzleLogger(logger),
		})
	}

	/*
	 * Gets the database instance.
	 * @returns {PostgresJsDatabase} The database instance.
	 */
	get(): PostgresJsDatabase {
		return this.database
	}
}
