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
	SyncRunDto,
	SyncRunGroupDto,
} from './dtos/dashboard.dto'

// ponytail: next cron is always 12h from epoch-aligned boundary, not from now
const getNextCronAt = (): string => {
	const now = Date.now()
	const interval = 12 * 60 * 60 * 1000
	return new Date(Math.ceil(now / interval) * interval).toISOString()
}

const parseSteps = (raw: string): SyncSteps => {
	try {
		return JSON.parse(raw) as SyncSteps
	} catch {
		return {
			auditoriums: { ok: false, count: 0 },
			groups: { ok: false, count: 0 },
			teachers: { ok: false, count: 0 },
		}
	}
}

const toRunDto = (row: typeof syncRunTable.$inferSelect): SyncRunDto => ({
	...row,
	startedAt: row.startedAt.toISOString(),
	finishedAt: row.finishedAt?.toISOString() ?? null,
	steps: parseSteps(row.stepsJson),
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

	async getRuns(limit = 20): Promise<SyncRunDto[]> {
		const rows = await this.syncRunsService.getRuns(limit)
		return rows.map(toRunDto)
	}

	async getRunGroups(runId: number): Promise<SyncRunGroupDto[]> {
		const rows = await this.syncRunsService.getRunGroups(runId)
		return rows.map((r) => ({ ...r, finishedAt: r.finishedAt.toISOString() }))
	}
}
