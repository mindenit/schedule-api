import { pgTable } from 'drizzle-orm/pg-core'
import { baseTableAttrs, referencialIntegrityOptions } from '../utils'
import { directionTable } from './direction'

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
