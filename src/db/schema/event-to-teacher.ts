import { pgTable, primaryKey } from 'drizzle-orm/pg-core'

import { referencialIntegrityOptions } from '../utils'
import { eventTable } from './event'
import { teacherTable } from './teacher'

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
		lastSeenAt: t.bigint({ mode: 'number' }).notNull().default(0),
	}),
	(t) => [primaryKey({ columns: [t.eventId, t.teacherId] })],
)
