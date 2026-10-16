import { sql, TransactionRollbackError } from 'drizzle-orm'
import { drizzle, PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { LoggerService } from 'src/components/logger/logger.service'
import { afterAll, describe, expect, it } from 'vitest'

import { CistEventsParser } from './events.cist-parser'
import { CistEventsProcessor } from './events.cist-processor'

// Integration test against a migrated Postgres. Opt-in: set TEST_DATABASE_URL.
// Fixtures live in temp tables (they shadow public.* via pg_temp) inside a
// transaction that is always rolled back, so the target DB is never modified.
const url = process.env.TEST_DATABASE_URL

const RUN_ID = 2_000
const G_FAILED = 1

describe.skipIf(!url)('CistEventsProcessor extra events (integration)', () => {
	const client = postgres(url ?? '', { max: 1 })
	const db = drizzle(client, { casing: 'snake_case' })

	afterAll(() => client.end())

	const withFixtures = async (
		fn: (processor: CistEventsProcessor) => Promise<void>,
	) => {
		await db
			.transaction(async (tx) => {
				for (const table of ['event', 'event_to_academic_group']) {
					await tx.execute(
						sql.raw(
							`CREATE TEMP TABLE ${table} (LIKE public.${table} INCLUDING DEFAULTS) ON COMMIT DROP`,
						),
					)
				}

				// 1: seen this run; 2: stale; 3: stale but linked to a failed group
				await tx.execute(sql`
					INSERT INTO event (id, started_at, ended_at, last_seen_at, auditorium_id, subject_id) VALUES
						(1, 1, 2, ${RUN_ID}, 1, 1),
						(2, 1, 2, ${RUN_ID - 1}, 1, 1),
						(3, 1, 2, ${RUN_ID - 1}, 1, 1)
				`)
				await tx.execute(sql`
					INSERT INTO event_to_academic_group (event_id, groud_id) VALUES (3, ${G_FAILED})
				`)

				const processor = new CistEventsProcessor(
					tx as unknown as PostgresJsDatabase,
					{} as CistEventsParser,
					{} as LoggerService,
				)

				await fn(processor)
				tx.rollback()
			})
			.catch((e: unknown) => {
				if (!(e instanceof TransactionRollbackError)) throw e
			})
	}

	it.each([
		['without protected groups', [], 2],
		['protecting failed groups', [G_FAILED], 1],
	])('counts exactly what it removes %s', async (_, protectedIds, expected) => {
		await withFixtures(async (processor) => {
			const count = await processor.countExtraEvents(RUN_ID, protectedIds)
			const removed = await processor.removeExtraEvents(RUN_ID, protectedIds)

			expect(count).toBe(expected)
			expect(removed).toBe(count)
		})
	})
})
