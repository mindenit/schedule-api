import { bigint, pgTable } from 'drizzle-orm/pg-core'
import { eventTypeEnum } from './event-type-enum.js'
import { subjectTable } from './subject.js'
import { teacherTable } from './teacher.js'
import { referencialIntegrityOptions } from '../utils.js'

export const subjectToTeacherTable = pgTable('subject_to_teacher', (t) => ({
	id: bigint({ mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
	hours: t.smallint(),
	type: eventTypeEnum(),
	subjectId: t
		.integer()
		.notNull()
		.references(() => subjectTable.id, referencialIntegrityOptions),
	teacherId: t
		.integer()
		.notNull()
		.references(() => teacherTable.id, referencialIntegrityOptions),
}))
