import { and, SQL } from 'drizzle-orm'
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { arrayFromFallible } from 'src/common/schemas/arrays.schema'
import {
	GetScheduleOptions,
	Schedule,
	ScheduleSchema,
} from 'src/common/schemas/schedule.schema'
import {
	buildScheduleQuery,
	getTimeIntervalConditions,
} from 'src/common/utils/schedule/schedule'

// Constants
const scheduleArraySchema = arrayFromFallible(ScheduleSchema)

export abstract class ScheduleRepository<F extends object> {
	constructor(protected readonly db: PostgresJsDatabase) {}

	protected abstract scopePredicate(id: number): SQL

	protected abstract buildFilters(filters: F): (SQL | undefined)[]

	async findSchedule(options: GetScheduleOptions<F>): Promise<Schedule[]> {
		const where = and(
			this.scopePredicate(options.id),
			...getTimeIntervalConditions(options),
			...this.buildFilters(options.filters),
		)!

		const rows = await this.db.execute(buildScheduleQuery(where))

		return scheduleArraySchema.parse(rows)
	}
}
