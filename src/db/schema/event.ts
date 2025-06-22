import { sql } from 'drizzle-orm'
import { bigint, check, pgTable } from 'drizzle-orm/pg-core'
import { auditoriumTable } from './auditorium.js'
import { eventTypeEnum } from './event-type-enum.js'
import { subjectTable } from './subject.js'
import { referencialIntegrityOptions } from '../utils.js'

export const eventTable = pgTable(
	'event',
	(t) => ({
		id: bigint({ mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
		startedAt: t.integer(),
		endedAt: t.integer(),
		numberPair: t.smallint(),
		type: eventTypeEnum(),
		auditoriumId: t
			.integer()
			.notNull()
			.references(() => auditoriumTable.id, referencialIntegrityOptions),
		subjectId: t
			.integer()
			.notNull()
			.references(() => subjectTable.id, referencialIntegrityOptions),
	}),
	(t) => [check('start_before_end', sql`${t.startedAt} < ${t.endedAt}`)],
)
