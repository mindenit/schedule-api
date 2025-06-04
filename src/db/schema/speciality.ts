import { pgTable } from 'drizzle-orm/pg-core'
import { baseTableAttrs } from '../utils.js'
import { directionTable } from './direction.js'

const { id, fullName, shortName } = baseTableAttrs

export const specialityTable = pgTable('speciality', (t) => ({
	id,
	fullName,
	shortName,
	directionId: t.integer().references(() => directionTable.id, {
		onDelete: 'cascade',
		onUpdate: 'cascade',
	}),
}))
