import { sql, TransactionRollbackError } from 'drizzle-orm'
import { drizzle, PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import Redis from 'ioredis'
import postgres from 'postgres'
import { SyncRunsService } from 'src/components/sync-runs/sync-runs.service'
import { afterAll, describe, expect, it } from 'vitest'

import { ScheduleService } from '../schedule/schedule.service'
import { DashboardService } from './dashboard.service'

// Integration test against a migrated Postgres. Opt-in: set TEST_DATABASE_URL.
// Fixtures live in temp tables (they shadow public.* via pg_temp) inside a
// transaction that is always rolled back, so the target DB is never modified.
const url = process.env.TEST_DATABASE_URL

const R1_OLD_SUCCESS = 1_000
const R2_OUTAGE = 2_000
const R3_PARTIAL = 3_000
const R4_MANUAL = 4_000
const R5_RUNNING = 5_000

const G_STALE = 1 // failed only in the outage run, never seen again
const G_FAILED = 2 // failed in the boundary run
const G_RECOVERED = 3 // failed in boundary run, succeeded in running run
const G_FAILED_NOW = 4 // succeeded in boundary run, failed in running run
const G_DISMISSED = 5 // failed in boundary run, dismissed

describe.skipIf(!url)('DashboardService failures scope (integration)', () => {
	const client = postgres(url ?? '', { max: 1 })
	const db = drizzle(client, { casing: 'snake_case' })

	afterAll(() => client.end())

	const withFixtures = async (
		fn: (service: DashboardService, tx: PostgresJsDatabase) => Promise<void>,
	) => {
		await db
			.transaction(async (tx) => {
				for (const table of ['sync_run', 'sync_run_group', 'academic_group']) {
					await tx.execute(
						sql.raw(
							`CREATE TEMP TABLE ${table} (LIKE public.${table} INCLUDING DEFAULTS) ON COMMIT DROP`,
						),
					)
				}

				await tx.execute(sql`
					INSERT INTO academic_group (id, name)
					SELECT i, 'G' || i FROM generate_series(1, 5) i
				`)
				await tx.execute(sql`
					INSERT INTO sync_run (id, started_at, status, trigger, total_groups) VALUES
						(${R1_OLD_SUCCESS}, to_timestamp(1), 'success', 'cron', 5),
						(${R2_OUTAGE}, to_timestamp(2), 'failed', 'cron', 5),
						(${R3_PARTIAL}, to_timestamp(3), 'partial', 'cron', 4),
						(${R4_MANUAL}, to_timestamp(4), 'success', 'manual', 1),
						(${R5_RUNNING}, to_timestamp(5), 'running', 'cron', 4)
				`)
				await tx.execute(sql`
					INSERT INTO sync_run_group (run_id, group_id, status, finished_at, dismissed) VALUES
						(${R1_OLD_SUCCESS}, ${G_STALE}, 'success', to_timestamp(10), false),
						(${R2_OUTAGE}, ${G_STALE}, 'failed', to_timestamp(20), false),
						(${R3_PARTIAL}, ${G_FAILED}, 'failed', to_timestamp(30), false),
						(${R3_PARTIAL}, ${G_RECOVERED}, 'failed', to_timestamp(31), false),
						(${R3_PARTIAL}, ${G_FAILED_NOW}, 'success', to_timestamp(32), false),
						(${R3_PARTIAL}, ${G_DISMISSED}, 'failed', to_timestamp(33), true),
						(${R5_RUNNING}, ${G_RECOVERED}, 'success', to_timestamp(50), false),
						(${R5_RUNNING}, ${G_FAILED_NOW}, 'failed', to_timestamp(51), false)
				`)

				const cache = { get: () => Promise.resolve(null) } as unknown as Redis
				const service = new DashboardService(
					tx as unknown as PostgresJsDatabase,
					cache,
					{} as SyncRunsService,
					{} as ScheduleService,
				)

				await fn(service, tx as unknown as PostgresJsDatabase)
				tx.rollback()
			})
			.catch((e: unknown) => {
				if (!(e instanceof TransactionRollbackError)) throw e
			})
	}

	it('lists only latest failures since the last good scheduled run', async () => {
		await withFixtures(async (service) => {
			const failures = await service.getFailures()

			expect(failures.map((f) => [f.groupId, f.runId])).toEqual([
				[G_FAILED_NOW, R5_RUNNING],
				[G_FAILED, R3_PARTIAL],
			])
			expect(failures[1].groupName).toBe(`G${G_FAILED}`)
		})
	})

	it('reports an uncapped failingGroups count and scheduled lastSuccessfulRun', async () => {
		await withFixtures(async (service, tx) => {
			const summary = await service.getSummary()
			const [{ events }] = await tx.execute<{ events: number }>(
				sql`SELECT count(*)::int AS events FROM event`,
			)

			expect(summary.failingGroups).toBe(2)
			expect(await service.getFailures(1)).toHaveLength(1)
			expect(summary.lastSuccessfulRun?.id).toBe(R3_PARTIAL)
			expect(summary.lastRun?.id).toBe(R5_RUNNING)
			expect(summary.totalEvents).toBe(events)
		})
	})

	it('falls back to all history when there is no good scheduled run', async () => {
		await withFixtures(async (service, tx) => {
			await tx.execute(
				sql`UPDATE sync_run SET status = 'failed' WHERE trigger <> 'manual' AND status <> 'running'`,
			)

			const failures = await service.getFailures()

			expect(failures.map((f) => f.groupId)).toEqual([
				G_FAILED_NOW,
				G_FAILED,
				G_STALE,
			])
			expect((await service.getSummary()).failingGroups).toBe(3)
		})
	})
})
