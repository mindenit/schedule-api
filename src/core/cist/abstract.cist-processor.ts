import { Table } from 'drizzle-orm'
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { PromiseResult } from 'src/common/types'
import { CistProcessor } from './interfaces/processor.interface'
import { AppException } from 'src/common/exceptions/app.exception'

// Types
type IdentifiableEntity = { id: string | number }

export type UploadJob = Readonly<{
	entities: IdentifiableEntity[]
	table: Table
}>

export abstract class CistAbstractProcessor<
	T extends object,
	E extends AppException<string>,
	A = never,
> implements CistProcessor<T, E, A>
{
	protected constructor(protected readonly db: PostgresJsDatabase) {}

	abstract process(args: A): PromiseResult<T, E>

	protected async uploadEntities({
		entities,
		table,
	}: UploadJob): Promise<void> {
		if (!entities.length) {
			return
		}

		await this.db.insert(table).values(entities).onConflictDoNothing()
	}
}
