import type { DatabaseClient } from '@/core/types/deps.js'
import type {
	GroupsInjectableDependencies,
	GroupsRepository,
} from '../types/index.js'
import type { Group } from '@/db/types.js'
import { academicGroupTable } from '@/db/schema/academic-group.js'
import { asc } from 'drizzle-orm'

export class GroupsRepositoryImpl implements GroupsRepository {
	private readonly db: DatabaseClient

	constructor({ db }: GroupsInjectableDependencies) {
		this.db = db.client
	}

	async findAll(): Promise<Group[]> {
		return this.db
			.select()
			.from(academicGroupTable)
			.orderBy(asc(academicGroupTable.name))
	}
}
