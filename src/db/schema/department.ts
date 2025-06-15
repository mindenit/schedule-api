import { pgTable } from 'drizzle-orm/pg-core'
import { baseTableAttrs, referencialIntegrityOptions } from '../utils.js'
import { facultyTable } from './faculty.js'

const { id, fullName, shortName } = baseTableAttrs

export const departmentTable = pgTable('department', (t) => ({
	id,
	fullName,
	shortName,
	facultyId: t
		.integer()
		.notNull()
		.references(() => facultyTable.id, referencialIntegrityOptions),
}))
