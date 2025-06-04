import { pgTable, primaryKey } from 'drizzle-orm/pg-core'
import { eventTable } from './event.js'
import { referencialIntegrityOptions } from '../utils.js'
import { academicGroupTable } from './academic-group.js'

export const eventToAcademicGroupTable = pgTable(
	'event_to_academic_group',
	(t) => ({
		eventId: t
			.integer()
			.references(() => eventTable.id, referencialIntegrityOptions),
		groudId: t
			.integer()
			.references(() => academicGroupTable.id, referencialIntegrityOptions),
	}),
	(t) => [primaryKey({ columns: [t.eventId, t.groudId] })],
)
