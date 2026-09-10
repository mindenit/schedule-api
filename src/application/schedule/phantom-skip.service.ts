import { Inject, Injectable } from '@nestjs/common'
import { eq, inArray, sql } from 'drizzle-orm'
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { DATABASE_CONNECTION_TOKEN } from 'src/components/database/di-tokens'
import { academicGroupTable, directionTable, facultyTable } from 'src/db/schema'

// Constants
// Administrative units that structurally never have a degree-track class
// schedule (postgrad/PhD studies, pre-university prep courses, continuing
// education). Confirmed via analysis of a 9-day production window: 211 of
// 211 groups under these faculties were empty in every observed run.
const DEAD_FACULTY_SHORT_NAMES = ['Аспірантура', 'ЦДП', 'ЦПО', 'ФЗН']

// A group needs this many consecutive confirmed-empty *successful* fetches
// before it's demoted to the weekly full-recheck only. Deliberately
// conservative (~3 weeks at 2 runs/day) -- a real group in production data
// had 15 consecutive empty runs before publishing events on the 16th, so a
// shorter threshold would have permanently missed it.
const EMPTY_STREAK_THRESHOLD = 30

@Injectable()
export class PhantomSkipService {
	constructor(
		@Inject(DATABASE_CONNECTION_TOKEN)
		private readonly db: PostgresJsDatabase,
	) {}

	/*
	 * Groups belonging to administrative faculties that never have a real
	 * class schedule, regardless of admission year or naming. Computable
	 * before ever fetching that group's schedule even once.
	 */
	async getStaticDeadGroupIds(): Promise<number[]> {
		const rows = await this.db
			.select({ id: academicGroupTable.id })
			.from(academicGroupTable)
			.innerJoin(
				directionTable,
				eq(directionTable.id, academicGroupTable.directionId),
			)
			.innerJoin(facultyTable, eq(facultyTable.id, directionTable.facultyId))
			.where(inArray(facultyTable.shortName, DEAD_FACULTY_SHORT_NAMES))

		return rows.map((r) => r.id)
	}

	/*
	 * Groups whose last EMPTY_STREAK_THRESHOLD *successful* fetches all
	 * returned zero events. Failed (e.g. CIST-down) attempts don't count
	 * toward or break the streak -- only successful, confirmed-empty ones do.
	 */
	async getHistoricallyEmptyGroupIds(): Promise<number[]> {
		const rows = await this.db.execute<{ group_id: number }>(sql`
			WITH ranked AS (
				SELECT
					group_id,
					events_count,
					ROW_NUMBER() OVER (PARTITION BY group_id ORDER BY run_id DESC) AS rn
				FROM sync_run_group
				WHERE status = 'success'
			)
			SELECT group_id
			FROM ranked
			WHERE rn <= ${EMPTY_STREAK_THRESHOLD}
			GROUP BY group_id
			HAVING count(*) = ${EMPTY_STREAK_THRESHOLD} AND bool_and(events_count = 0)
		`)

		return rows.map((r) => Number(r.group_id))
	}

	async getSkipSet(): Promise<Set<number>> {
		const [staticDead, historicallyEmpty] = await Promise.all([
			this.getStaticDeadGroupIds(),
			this.getHistoricallyEmptyGroupIds(),
		])

		return new Set([...staticDead, ...historicallyEmpty])
	}

	/*
	 * True on the designated weekly full-recheck run (Sunday 00:00 Kyiv) --
	 * every group gets a fresh look, ignoring the skip-set entirely, right
	 * before the school week starts.
	 */
	isFullRecheckRun(now: Date = new Date()): boolean {
		const weekday = now.toLocaleString('en-US', {
			weekday: 'short',
			timeZone: 'Europe/Kyiv',
		})
		const hour = Number(
			now.toLocaleString('en-US', {
				hour: 'numeric',
				hour12: false,
				timeZone: 'Europe/Kyiv',
			}),
		)

		return weekday === 'Sun' && hour === 0
	}
}
