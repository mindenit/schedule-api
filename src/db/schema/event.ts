import { sql } from 'drizzle-orm'
import { bigint, check, index, pgTable, uniqueIndex } from 'drizzle-orm/pg-core'

import { referencialIntegrityOptions } from '../utils'
import { auditoriumTable } from './auditorium'
import { eventTypeEnum } from './event-type-enum'
import { subjectTable } from './subject'

export const eventTable = pgTable(
	'event',
	(t) => ({
		id: bigint({ mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
		startedAt: t.integer(),
		endedAt: t.integer(),
		numberPair: t.smallint(),
		type: eventTypeEnum(),
		lastSeenAt: t.bigint({ mode: 'number' }).notNull(),
		teachersKey: t.text().notNull().default(''),
		auditoriumId: t
			.integer()
			.notNull()
			.references(() => auditoriumTable.id, referencialIntegrityOptions),
		subjectId: t
			.integer()
			.notNull()
			.references(() => subjectTable.id, referencialIntegrityOptions),
	}),
	(t) => [
		check('start_before_end', sql`${t.startedAt} < ${t.endedAt}`),
		uniqueIndex('event_natural_key').on(
			t.startedAt,
			t.endedAt,
			t.subjectId,
			t.type,
			t.auditoriumId,
			t.numberPair,
			t.teachersKey,
		),
		// auditoriumId is a non-leading column in the composite unique index
		// above, not usable for a plain `WHERE auditorium_id = X` lookup --
		// findAuditoriumGroups/Teachers and the hasEvents=true filter need it.
		index('event_auditorium_id_idx').on(t.auditoriumId),
	],
)
