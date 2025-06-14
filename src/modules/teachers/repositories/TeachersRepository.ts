import type { DatabaseClient } from '@/core/types/deps.js'
import type {
	TeachersInjectableDependencies,
	TeachersRepository,
} from '../types/index.js'
import type { Schedule, Teacher } from '@/db/types.js'
import { teacherTable } from '@/db/schema/teacher.js'
import { SQL, asc, sql } from 'drizzle-orm'
import type { GET_SCHEDULE_OPTIONS } from '@/modules/schedule/schemas/index.js'
import {
	buildScheduleQuery,
	getTimeIntervalQuery,
} from '@/modules/schedule/utils/index.js'

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
