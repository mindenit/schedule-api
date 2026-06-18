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
			// Explicit pool settings so behaviour is predictable regardless of
			// postgres-js version defaults.
			max: 10,
			// Release idle connections after 30 s to avoid holding Postgres slots
			// needlessly between seed runs.
			idle_timeout: 30,
			// Surface connection failures fast instead of hanging indefinitely;
			// keeps HTTP request handlers from waiting on a stalled pool slot.
			connect_timeout: 10,
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
