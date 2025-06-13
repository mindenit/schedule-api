import type { DatabaseClient } from '@/core/types/deps.js'
import type {
	TeachersInjectableDependencies,
	TeachersRepository,
} from '../types/index.js'
import type { Teacher } from '@/db/types.js'
import { teacherTable } from '@/db/schema/teacher.js'
import { asc } from 'drizzle-orm'

export class TeachersRepositoryImpl implements TeachersRepository {
	private readonly db: DatabaseClient

	constructor({ db }: TeachersInjectableDependencies) {
		this.db = db.client
	}

	async findAll(): Promise<Teacher[]> {
		return this.db
			.select()
			.from(teacherTable)
			.orderBy(asc(teacherTable.shortName))
	}
}
