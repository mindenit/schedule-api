import type { DatabaseClient } from '@/core/types/deps.js'
import type {
	AuditoriumsInjectableDependencies,
	AuditoriumsRepository,
} from '../types/index.js'
import type { Auditorium, Schedule } from '@/db/types.js'
import { auditoriumTable } from '@/db/schema/auditorium.js'
import { SQL, asc, sql, notLike, eq } from 'drizzle-orm'
import type { GET_SCHEDULE_OPTIONS } from '@/modules/schedule/schemas/index.js'

import {
	buildScheduleQuery,
	getFiltersQuery,
	getTimeIntervalQuery,
} from '@/modules/schedule/utils/index.js'
import type { Maybe } from '@/core/types/index.js'

export class AuditoriumsRepositoryImpl implements AuditoriumsRepository {
	private readonly db: DatabaseClient

	constructor({ db }: AuditoriumsInjectableDependencies) {
		this.db = db.client
	}

	async findAll(): Promise<Auditorium[]> {
		return this.db
			.select()
			.from(auditoriumTable)
			.where(notLike(auditoriumTable.name, 'DL%'))
			.orderBy(asc(auditoriumTable.name))
	}

	async findOne(id: number): Promise<Maybe<Auditorium>> {
		const [auditorium] = await this.db
			.select()
			.from(auditoriumTable)
			.where(eq(auditoriumTable.id, id))

		return auditorium ?? null
	}

	async getSchedule(options: GET_SCHEDULE_OPTIONS): Promise<Schedule[]> {
		const { id } = options

		const whereClause: SQL[] = [sql`e.auditorium_id = ${id}`]

		const timeInterval = getTimeIntervalQuery(options)

		whereClause.push(...timeInterval)

		const filters = getFiltersQuery(options.filters)

		whereClause.push(...filters)

		const query = buildScheduleQuery(whereClause)

		const schedule = await this.db.execute(query)

		return schedule as unknown as Schedule[]
	}
}
