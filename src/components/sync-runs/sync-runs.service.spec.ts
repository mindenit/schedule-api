import { sql, TransactionRollbackError } from 'drizzle-orm'
import { drizzle, PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { afterAll, describe, expect, it } from 'vitest'

import { SyncRunsService } from './sync-runs.service'

// Integration test against a migrated Postgres. Opt-in: set TEST_DATABASE_URL.
// Fixtures live in temp tables (they shadow public.* via pg_temp) inside a
// transaction that is always rolled back, so the target DB is never modified.
const url = process.env.TEST_DATABASE_URL

describe.skipIf(!url)(
	'SyncRunsService.getLastGoodGroupsCount (integration)',
	() => {
		const client = postgres(url ?? '', { max: 1 })
		const db = drizzle(client, { casing: 'snake_case' })

		afterAll(() => client.end())

		const withRuns = async (
			rows: string,
			fn: (service: SyncRunsService) => Promise<void>,
		) => {
			await db
				.transaction(async (tx) => {
					await tx.execute(
						sql.raw(
							'CREATE TEMP TABLE sync_run (LIKE public.sync_run INCLUDING DEFAULTS) ON COMMIT DROP',
						),
					)
					if (rows) {
						await tx.execute(
							sql.raw(
								`INSERT INTO sync_run (id, started_at, status, trigger, total_groups, steps) VALUES ${rows}`,
							),
						)
					}

					await fn(new SyncRunsService(tx as unknown as PostgresJsDatabase))
					tx.rollback()
				})
				.catch((e: unknown) => {
					if (!(e instanceof TransactionRollbackError)) throw e
				})
		}

		it('uses the CIST list size of the latest good scheduled run', async () => {
			await withRuns(
				`(1, to_timestamp(1), 'success', 'cron', 900, '{"groups":{"ok":true,"count":1000}}'),
			 (2, to_timestamp(2), 'partial', 'cron', 1466, '{"groups":{"ok":false,"count":0,"error":"x"}}'),
			 (3, to_timestamp(3), 'failed', 'cron', 1100, '{"groups":{"ok":true,"count":1100}}'),
			 (4, to_timestamp(4), 'success', 'manual', 1, '{"manualRefetch":{}}'),
			 (5, to_timestamp(5), 'running', 'cron', 0, '{}')`,
				async (service) => {
					expect(await service.getLastGoodGroupsCount()).toBe(1000)
				},
			)
		})

		it('returns null without a good run', async () => {
			await withRuns('', async (service) => {
				expect(await service.getLastGoodGroupsCount()).toBeNull()
			})
		})
	},
)
