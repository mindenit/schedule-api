import { Table } from 'drizzle-orm'
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import Redis from 'ioredis'
import { ENTITY_EXISTANCE } from 'src/common/constants/redis'
import { PromiseResult } from 'src/common/types'
import { CistProcessor } from './interfaces/processor.interface'
import { AppException } from 'src/common/exceptions/app.exception'

// Types
type IdentifiableEntity = { id: string | number }

export type UploadJob = Readonly<{
	entities: IdentifiableEntity[]
	table: Table
	computeKey: (id: IdentifiableEntity['id']) => string
}>

export abstract class CistAbstractProcessor<
	T extends object,
	E extends AppException<string>,
	A = never,
> implements CistProcessor<T, E, A>
{
	protected constructor(
		protected readonly db: PostgresJsDatabase,
		protected readonly cache: Redis,
	) {}

	abstract process(args: A): PromiseResult<T, E>

	protected async uploadEntities({
		entities,
		table,
		computeKey,
	}: UploadJob): Promise<void> {
		for (const entity of entities) {
			const key = computeKey(entity.id)

			if (await this.cache.exists(key)) {
				continue
			}

			await Promise.all([
				this.db.insert(table).values(entity).onConflictDoNothing(),
				this.cache.set(key, ENTITY_EXISTANCE.EXISTS),
			])
		}
	}
}
