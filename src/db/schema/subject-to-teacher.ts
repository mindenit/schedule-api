import { bigint, pgTable } from 'drizzle-orm/pg-core'
import { eventTypeEnum } from './event-type-enum.js'
import { subjectTable } from './subject.js'
import { teacherTable } from './teacher.js'

export const subjectToTeacherTable = pgTable('subject_to_teacher', (t) => ({
	id: bigint({ mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
	hours: t.smallint(),
	type: eventTypeEnum(),
	subjectId: t.integer().references(() => subjectTable.id, {
		onDelete: 'cascade',
		onUpdate: 'cascade',
	}),
	teacherId: t.integer().references(() => teacherTable.id, {
		onDelete: 'cascade',
		onUpdate: 'cascade',
	}),
}))
