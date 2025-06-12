import type { DatabaseClient } from '@/core/types/deps.js'
import type {
	AuditoriumsInjectableDependencies,
	AuditoriumsRepository,
} from '../types/index.js'
import type { Auditorium } from '@/db/types.js'
import { auditoriumTable } from '@/db/schema/auditorium.js'
import { asc } from 'drizzle-orm'

export class AuditoriumsRepositoryImpl implements AuditoriumsRepository {
	private readonly db: DatabaseClient

	constructor({ db }: AuditoriumsInjectableDependencies) {
		this.db = db.client
	}

	async findAll(): Promise<Auditorium[]> {
		return this.db
			.select()
			.from(auditoriumTable)
			.orderBy(asc(auditoriumTable.name))
	}
}
