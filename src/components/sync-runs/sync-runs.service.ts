import { Inject, Injectable } from '@nestjs/common'
import { desc, eq, sql } from 'drizzle-orm'
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { DATABASE_CONNECTION_TOKEN } from 'src/components/database/di-tokens'
import { syncRunGroupTable, syncRunTable } from 'src/db/schema'

// Constants
const RETENTION_DAYS = 30

export type SyncRunTrigger = 'cron' | 'bootstrap'

export interface StepResult {
	ok: boolean
	count: number
	error?: string
}

export interface SyncSteps {
	auditoriums: StepResult
	groups: StepResult
	teachers: StepResult
}

@Injectable()
export class SyncRunsService {
	constructor(
		@Inject(DATABASE_CONNECTION_TOKEN)
		private readonly db: PostgresJsDatabase,
	) {}

	async open(runId: number, trigger: SyncRunTrigger): Promise<void> {
		// Reconcile any orphaned 'running' rows left by a crashed/restarted container.
		await this.db
			.update(syncRunTable)
			.set({ status: 'failed', finishedAt: new Date() })
			.where(eq(syncRunTable.status, 'running'))
		await this.db.insert(syncRunTable).values({
			id: runId,
			startedAt: new Date(runId),
			status: 'running',
			trigger,
		})
	}

	async setTotalGroups(runId: number, totalGroups: number): Promise<void> {
		await this.db
			.update(syncRunTable)
			.set({ totalGroups })
			.where(eq(syncRunTable.id, runId))
	}

	async close(
		runId: number,
		opts: {
			status: 'success' | 'partial' | 'failed'
			totalGroups: number
			failedGroups: number
			removedEvents: number
			totalEvents: number
			steps: SyncSteps
		},
	): Promise<void> {
		await this.db
			.update(syncRunTable)
			.set({
				finishedAt: new Date(),
				status: opts.status,
				totalGroups: opts.totalGroups,
				failedGroups: opts.failedGroups,
				removedEvents: opts.removedEvents,
				totalEvents: opts.totalEvents,
				steps: opts.steps,
			})
			.where(eq(syncRunTable.id, runId))
	}

	async recordGroup(
		runId: number,
		groupId: number,
		opts: { status: 'success' | 'failed'; eventsCount: number; error?: string },
	): Promise<void> {
		const status = opts.status
		await this.db
			.insert(syncRunGroupTable)
			.values({
				runId,
				groupId,
				status,
				eventsCount: opts.eventsCount,
				error: opts.error ?? null,
				finishedAt: new Date(),
			})
			.onConflictDoUpdate({
				target: [syncRunGroupTable.runId, syncRunGroupTable.groupId],
				set: {
					status,
					eventsCount: opts.eventsCount,
					error: opts.error ?? null,
					finishedAt: new Date(),
				},
			})
	}

	async getRuns(limit = 20): Promise<(typeof syncRunTable.$inferSelect)[]> {
		return this.db
			.select()
			.from(syncRunTable)
			.orderBy(desc(syncRunTable.startedAt))
			.limit(limit)
	}

	async purgeOldRuns(): Promise<number> {
		const cutoff = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000)
		const result = await this.db
			.delete(syncRunTable)
			.where(sql`${syncRunTable.startedAt} < ${cutoff}`)
			.returning({ id: syncRunTable.id })
		return result.length
	}
}
