import { pgTable } from 'drizzle-orm/pg-core'
import { baseTableAttrs } from '../utils.js'
import { subjectTable } from './subject.js'
import { eventTypeEnum } from './event-type-enum.js'

const { id } = baseTableAttrs

export const subjectToTeacherTable = pgTable('subject_to_teacher', (t) => ({
	id,
	hours: t.smallint(),
	type: eventTypeEnum(),
	subjectId: t.integer().references(() => subjectTable.id, {
		onDelete: 'cascade',
		onUpdate: 'cascade',
	}),
	teacherId: t.integer().references(() => subjectTable.id, {
		onDelete: 'cascade',
		onUpdate: 'cascade',
	}),
}))
