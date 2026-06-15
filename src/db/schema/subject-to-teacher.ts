import { bigint, pgTable } from 'drizzle-orm/pg-core'
import { eventTypeEnum } from './event-type-enum.js'
import { subjectTable } from './subject'
import { teacherTable } from './teacher'
import { referencialIntegrityOptions } from '../utils'

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
