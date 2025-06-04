import { pgTable } from 'drizzle-orm/pg-core'
import { baseTableAttrs } from '../utils.js'
import { directionTable } from './direction.js'
import { specialityTable } from './speciality.js'

const { id, fullName } = baseTableAttrs

export const academicGroupTable = pgTable('academic_group', (t) => ({
	id,
	name: fullName,
	directionId: t.integer().references(() => directionTable.id, {
		onDelete: 'cascade',
		onUpdate: 'cascade',
	}),
	specialityId: t.integer().references(() => specialityTable.id, {
		onDelete: 'cascade',
		onUpdate: 'cascade',
	}),
}))
