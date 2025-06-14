import { pgTable } from 'drizzle-orm/pg-core'
import { baseTableAttrs } from '../utils.js'
import { directionTable } from './direction.js'
import { specialityTable } from './speciality.js'

export const academicGroupTable = pgTable('academic_group', (t) => ({
	id: baseTableAttrs.id,
	name: t.varchar({ length: 255 }).notNull(),
	directionId: t.integer().references(() => directionTable.id, {
		onDelete: 'cascade',
		onUpdate: 'cascade',
	}),
	specialityId: t.integer().references(() => specialityTable.id, {
		onDelete: 'cascade',
		onUpdate: 'cascade',
	}),
}))
