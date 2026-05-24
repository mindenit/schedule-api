import { pgTable } from 'drizzle-orm/pg-core'
import { baseTableAttrs, referencialIntegrityOptions } from '../utils'
import { facultyTable } from './faculty'

const { id, fullName, shortName } = baseTableAttrs

export const directionTable = pgTable('direction', (t) => ({
	id,
	fullName,
	shortName,
	facultyId: t
		.integer()
		.notNull()
		.references(() => facultyTable.id, referencialIntegrityOptions),
}))
