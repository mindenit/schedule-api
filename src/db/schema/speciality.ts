import { pgTable } from 'drizzle-orm/pg-core'
import { baseTableAttrs, referencialIntegrityOptions } from '../utils.js'
import { directionTable } from './direction.js'

const { id, fullName, shortName } = baseTableAttrs

export const specialityTable = pgTable('speciality', (t) => ({
	id,
	fullName,
	shortName,
	directionId: t
		.integer()
		.notNull()
		.references(() => directionTable.id, referencialIntegrityOptions),
}))
