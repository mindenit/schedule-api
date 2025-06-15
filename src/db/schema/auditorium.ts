import { pgTable } from 'drizzle-orm/pg-core'
import { baseTableAttrs } from '../utils.js'
import { buildingTable } from './building.js'

export const auditoriumTable = pgTable('auditorium', (t) => ({
	id: baseTableAttrs.id,
	name: t.varchar({ length: 255 }).notNull(),
	floor: t.smallint(),
	hasPower: t.boolean(),
	buildingId: t.varchar().references(() => buildingTable.id, {
		onDelete: 'cascade',
		onUpdate: 'cascade',
	}),
}))
