import { pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

export const syncRunStatusEnum = pgEnum('sync_run_status', [
	'running',
	'success',
	'partial',
	'failed',
])

export const syncRunTriggerEnum = pgEnum('sync_run_trigger', [
	'cron',
	'bootstrap',
])

export const syncRunTable = pgTable('sync_run', (t) => ({
	id: t.bigint({ mode: 'number' }).primaryKey(),
	startedAt: timestamp({ withTimezone: true }).notNull(),
	finishedAt: timestamp({ withTimezone: true }),
	status: syncRunStatusEnum().notNull().default('running'),
	trigger: syncRunTriggerEnum().notNull(),
	totalGroups: t.integer().notNull().default(0),
	failedGroups: t.integer().notNull().default(0),
	removedEvents: t.integer().notNull().default(0),
	stepsJson: text().notNull().default('{}'),
}))
