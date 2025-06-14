import type { DatabaseClient } from '@/core/types/deps.js'
import type {
	AuditoriumsInjectableDependencies,
	AuditoriumsRepository,
} from '../types/index.js'
import type { Auditorium, Schedule } from '@/db/types.js'
import { auditoriumTable } from '@/db/schema/auditorium.js'
import { SQL, asc, sql } from 'drizzle-orm'
import type { GET_SCHEDULE_OPTIONS } from '@/modules/schedule/schemas/index.js'

import {
	buildScheduleQuery,
	getTimeIntervalQuery,
} from '@/modules/schedule/utils/index.js'

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

	async getSchedule(options: GET_SCHEDULE_OPTIONS): Promise<Schedule[]> {
		const { id } = options

		const whereClause: SQL[] = [sql`e.auditorium_id = ${id}`]

		const timeInterval = getTimeIntervalQuery(options)

		whereClause.push(...timeInterval)

		const query = buildScheduleQuery(whereClause)

		const schedule = await this.db.execute(query)

		return schedule as unknown as Schedule[]
	}
}
