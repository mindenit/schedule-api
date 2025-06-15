import { pgTable, primaryKey } from 'drizzle-orm/pg-core'
import { eventTable } from './event.js'
import { teacherTable } from './teacher.js'
import { referencialIntegrityOptions } from '../utils.js'

export const eventToTeacherTable = pgTable(
	'event_to_teacher',
	(t) => ({
		eventId: t
			.integer()
			.notNull()
			.references(() => eventTable.id, referencialIntegrityOptions),
		teacherId: t
			.integer()
			.notNull()
			.references(() => teacherTable.id, referencialIntegrityOptions),
	}),
	(t) => [primaryKey({ columns: [t.eventId, t.teacherId] })],
)
