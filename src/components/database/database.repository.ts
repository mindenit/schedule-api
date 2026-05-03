import { Table } from 'drizzle-orm'

export class DatabaseRepository<Schema extends Table> {
	protected readonly table: Schema

	/*
	 * Creates a new DatabaseRepository instance with the provided table schema.
	 * @param table - The table schema to use for the repository.
	 */
	constructor(table: Schema) {
		this.table = table
	}
}
