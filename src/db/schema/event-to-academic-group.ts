import { pgTable, primaryKey } from 'drizzle-orm/pg-core'

import { referencialIntegrityOptions } from '../utils'
import { academicGroupTable } from './academic-group'
import { eventTable } from './event'

export const eventToAcademicGroupTable = pgTable(
	'event_to_academic_group',
	(t) => ({
		eventId: t
			.integer()
			.notNull()
			.references(() => eventTable.id, referencialIntegrityOptions),
		groudId: t
			.integer()
			.notNull()
			.references(() => academicGroupTable.id, referencialIntegrityOptions),
		lastSeenAt: t.bigint({ mode: 'number' }).notNull().default(0),
	}),
	(t) => [primaryKey({ columns: [t.eventId, t.groudId] })],
)
