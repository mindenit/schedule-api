import { Inject, Injectable } from '@nestjs/common'
import { desc, eq, sql } from 'drizzle-orm'
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import Redis from 'ioredis'
import {
	IS_UPDATE_IN_PROGRESS_KEY,
	UPDATE_STATUS,
} from 'src/common/constants/health-status'
import { CACHE_CONNECTION_TOKEN } from 'src/components/cache/di-tokens'
import { DATABASE_CONNECTION_TOKEN } from 'src/components/database/di-tokens'
import {
	SyncRunsService,
	SyncSteps,
} from 'src/components/sync-runs/sync-runs.service'
import { syncRunGroupTable, syncRunTable } from 'src/db/schema'

import {
	DashSummaryDto,
	FailedGroupEntryDto,
	SyncRunDto,
	SyncRunGroupDto,
	TableSizeEntryDto,
} from './dtos/dashboard.dto'

// Cron fires at 00:00 and 12:00 Europe/Kyiv. Compute next boundary by
// checking current Kyiv hour; next boundary is at the next 0 or 12 in Kyiv.
const getNextCronAt = (): string => {
	const now = new Date()
	const kyivHour = Number(
		now.toLocaleString('en-US', {
			hour: 'numeric',
			hour12: false,
			timeZone: 'Europe/Kyiv',
		}),
	)
	const kyivHoursUntilNext = kyivHour < 12 ? 12 - kyivHour : 24 - kyivHour
	// Build the next boundary: floor to current Kyiv hour, add hours-until-next
	const next = new Date(now)
	next.setMinutes(0, 0, 0)
	next.setTime(next.getTime() + kyivHoursUntilNext * 60 * 60 * 1000)
	return next.toISOString()
}

const toRunDto = (row: typeof syncRunTable.$inferSelect): SyncRunDto => ({
	...row,
	startedAt: row.startedAt.toISOString(),
	finishedAt: row.finishedAt?.toISOString() ?? null,
	steps: row.steps as SyncSteps,
})

@Injectable()
export class DashboardService {
	constructor(
		@Inject(DATABASE_CONNECTION_TOKEN)
		private readonly db: PostgresJsDatabase,
		@Inject(CACHE_CONNECTION_TOKEN)
		private readonly cache: Redis,
		private readonly syncRunsService: SyncRunsService,
	) {}

	async getSummary(): Promise<DashSummaryDto> {
		const isRunningFlag = await this.cache.get(IS_UPDATE_IN_PROGRESS_KEY)
		const isRunning = isRunningFlag === UPDATE_STATUS.IN_PROGRESS

		const [lastRun] = await this.db
			.select()
			.from(syncRunTable)
			.orderBy(desc(syncRunTable.startedAt))
			.limit(1)

		const [lastSuccessfulRun] = await this.db
			.select()
			.from(syncRunTable)
			.where(eq(syncRunTable.status, 'success'))
			.orderBy(desc(syncRunTable.startedAt))
			.limit(1)

		const [{ count }] = await this.db
			.select({ count: sql<number>`count(*)::int` })
			.from(syncRunTable)

		// Progress: how many groups recorded so far in the running run
		let progress: DashSummaryDto['progress'] = null
		if (isRunning && lastRun?.status === 'running') {
			const [{ done }] = await this.db
				.select({ done: sql<number>`count(*)::int` })
				.from(syncRunGroupTable)
				.where(eq(syncRunGroupTable.runId, lastRun.id))

			progress = {
				current: done,
				total: lastRun.totalGroups,
			}
		}

		const currentStatus = lastRun ? lastRun.status : 'unknown'

		return {
			currentStatus,
			isRunning,
			lastRun: lastRun ? toRunDto(lastRun) : null,
			lastSuccessfulRun: lastSuccessfulRun ? toRunDto(lastSuccessfulRun) : null,
			nextCronAt: getNextCronAt(),
			totalRuns: count,
			progress,
		}
	}

	async getRuns(limit?: number): Promise<SyncRunDto[]> {
		const n = Math.min(Math.max(limit ?? 20, 1), 100)
		const rows = await this.syncRunsService.getRuns(n)
		return rows.map(toRunDto)
	}

	async getRunGroups(runId: number): Promise<SyncRunGroupDto[]> {
		// Join current run's groups with their events_count from the previous run
		// for the same group_id (the most recent run before this one per group).
		const rows = await this.db.execute<{
			run_id: number
			group_id: number
			status: 'success' | 'failed'
			events_count: number
			prev_events_count: number | null
			error: string | null
			finished_at: Date
		}>(sql`
			SELECT
				g.run_id,
				g.group_id,
				g.status,
				g.events_count,
				g.error,
				g.finished_at,
				prev.events_count AS prev_events_count
			FROM sync_run_group g
			LEFT JOIN LATERAL (
				SELECT p.events_count
				FROM sync_run_group p
				JOIN sync_run r ON r.id = p.run_id
				WHERE p.group_id = g.group_id
					AND p.run_id < g.run_id
					AND r.status IN ('success', 'partial')
				ORDER BY p.run_id DESC
				LIMIT 1
			) prev ON true
			WHERE g.run_id = ${runId}
		`)

		return rows.map((r) => ({
			runId: Number(r.run_id),
			groupId: Number(r.group_id),
			status: r.status,
			eventsCount: Number(r.events_count),
			prevEventsCount:
				r.prev_events_count !== null ? Number(r.prev_events_count) : null,
			error: r.error,
			finishedAt: new Date(r.finished_at).toISOString(),
		}))
	}

	async getFailures(limit?: number): Promise<FailedGroupEntryDto[]> {
		const n = Math.min(Math.max(limit ?? 50, 1), 100)
		const rows = await this.db.execute<{
			run_id: number
			group_id: number
			error: string | null
			finished_at: Date
		}>(sql`
			SELECT run_id, group_id, error, finished_at
			FROM sync_run_group
			WHERE status = 'failed'
			ORDER BY finished_at DESC
			LIMIT ${n}
		`)

		return rows.map((r) => ({
			runId: Number(r.run_id),
			groupId: Number(r.group_id),
			error: r.error,
			finishedAt: new Date(r.finished_at).toISOString(),
		}))
	}

	async getTableSizes(): Promise<TableSizeEntryDto[]> {
		const rows = await this.db.execute<{
			table_name: string
			row_count: number
			size_pretty: string
			size_bytes: number
		}>(sql`
			SELECT
				relname AS table_name,
				n_live_tup AS row_count,
				pg_size_pretty(pg_total_relation_size(relid)) AS size_pretty,
				pg_total_relation_size(relid) AS size_bytes
			FROM pg_stat_user_tables
			ORDER BY size_bytes DESC
		`)

		return rows.map((r) => ({
			tableName: r.table_name,
			rowCount: Number(r.row_count),
			sizePretty: r.size_pretty,
			sizeBytes: Number(r.size_bytes),
		}))
	}
}
