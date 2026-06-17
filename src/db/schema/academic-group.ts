import { pgTable } from 'drizzle-orm/pg-core'

import { baseTableAttrs, referencialIntegrityOptions } from '../utils'
import { directionTable } from './direction'
import { specialityTable } from './speciality'

export const academicGroupTable = pgTable('academic_group', (t) => ({
	id: baseTableAttrs.id,
	name: t.varchar({ length: 255 }).notNull(),
	directionId: t
		.integer()
		.references(() => directionTable.id, referencialIntegrityOptions),
	specialityId: t
		.integer()
		.references(() => specialityTable.id, referencialIntegrityOptions),
}))
