import { pgTable } from 'drizzle-orm/pg-core'
import { baseTableAttrs, referencialIntegrityOptions } from '../utils'
import { buildingTable } from './building'

export const auditoriumTable = pgTable('auditorium', (t) => ({
	id: baseTableAttrs.id,
	name: t.varchar({ length: 255 }).notNull(),
	floor: t.smallint().notNull(),
	hasPower: t.boolean().notNull(),
	buildingId: t
		.varchar()
		.notNull()
		.references(() => buildingTable.id, referencialIntegrityOptions),
}))
