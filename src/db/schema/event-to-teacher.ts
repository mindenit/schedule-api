import { index, pgTable, primaryKey } from 'drizzle-orm/pg-core'

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
	}),
	(t) => [
		primaryKey({ columns: [t.eventId, t.teacherId] }),
		// teacherId is the second column of the composite PK, not independently
		// indexed -- reverse lookups (findTeacherAuditoriums/Groups/Subjects,
		// the hasEvents=true filter) all query by teacherId alone.
		index('event_to_teacher_teacher_id_idx').on(t.teacherId),
	],
)
