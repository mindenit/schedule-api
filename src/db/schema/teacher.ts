import { pgTable } from 'drizzle-orm/pg-core'
import { baseTableAttrs } from '../utils.js'
import { departmentTable } from './department.js'

const { id, fullName, shortName } = baseTableAttrs

export const teacherTable = pgTable('teacher', (t) => ({
	id,
	fullName,
	shortName,
	departmentId: t.integer().references(() => departmentTable.id, {
		onDelete: 'cascade',
		onUpdate: 'cascade',
	}),
}))
