import { pgTable } from 'drizzle-orm/pg-core'
import { baseTableAttrs } from '../utils.js'
import { facultyTable } from './faculty.js'

const { id, fullName, shortName } = baseTableAttrs

export const departmentTable = pgTable('department', (t) => ({
	id,
	fullName,
	shortName,
	facultyId: t.integer().references(() => facultyTable.id, {
		onDelete: 'cascade',
		onUpdate: 'cascade',
	}),
}))
