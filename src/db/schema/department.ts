import { pgTable } from 'drizzle-orm/pg-core'

import { baseTableAttrs, referencialIntegrityOptions } from '../utils'
import { facultyTable } from './faculty'

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
