import { Injectable } from '@nestjs/common'
import { drizzle, PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { ConfigService } from '../config/config.service'
import postgres from 'postgres'

@Injectable()
export class DatabaseService {
	private _database: PostgresJsDatabase

	constructor(private readonly configService: ConfigService) {
		const { user, password, host, port, database } =
			this.configService.get('db')

		const queryClient = postgres({
			username: user,
			password,
			host,
			port,
			database,
		})

		this._database = drizzle(queryClient, {
			casing: 'snake_case',
		})
	}

	/*
	 * Gets the database instance.
	 * @returns {PostgresJsDatabase} The database instance.
	 */
	get(): PostgresJsDatabase {
		return this._database
	}
}
