import { pgEnum, pgTable, primaryKey, timestamp } from 'drizzle-orm/pg-core'

import { referencialIntegrityOptions } from '../utils'
import { academicGroupTable } from './academic-group'
import { syncRunTable } from './sync-run'

export const syncRunGroupStatusEnum = pgEnum('sync_run_group_status', [
	'success',
	'failed',
])

export const syncRunGroupTable = pgTable(
	'sync_run_group',
	(t) => ({
		runId: t
			.bigint({ mode: 'number' })
			.notNull()
			.references(() => syncRunTable.id, referencialIntegrityOptions),
		groupId: t
			.integer()
			.notNull()
			.references(() => academicGroupTable.id, referencialIntegrityOptions),
		status: syncRunGroupStatusEnum().notNull(),
		eventsCount: t.integer().notNull().default(0),
		error: t.text(),
		finishedAt: timestamp({ withTimezone: true }).notNull(),
	}),
	(t) => [primaryKey({ columns: [t.runId, t.groupId] })],
)
