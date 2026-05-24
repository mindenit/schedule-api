import { pgTable } from 'drizzle-orm/pg-core'
import { baseTableAttrs, referencialIntegrityOptions } from '../utils'
import { departmentTable } from './department'

const { id, fullName, shortName } = baseTableAttrs

export const teacherTable = pgTable('teacher', (t) => ({
	id,
	fullName,
	shortName,
	departmentId: t
		.integer()
		.notNull()
		.references(() => departmentTable.id, referencialIntegrityOptions),
}))
