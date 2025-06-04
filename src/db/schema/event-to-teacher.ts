import { pgTable, primaryKey } from 'drizzle-orm/pg-core'
import { eventTable } from './event.js'
import { teacherTable } from './teacher.js'

export const eventToTeacherTable = pgTable(
	'event_to_teacher',
	(t) => ({
		eventId: t.integer().references(() => eventTable.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
		teacherId: t.integer().references(() => teacherTable.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
	}),
	(t) => [primaryKey({ columns: [t.eventId, t.teacherId] })],
)
