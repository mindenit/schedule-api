import { pgTable } from 'drizzle-orm/pg-core'
import { baseTableAttrs } from '../utils.js'
import { buildingTable } from './building.js'

const { id, fullName } = baseTableAttrs

export const auditoriumTable = pgTable('auditorium', (t) => ({
	id,
	fullName,
	floor: t.smallint(),
	hasPower: t.boolean(),
	buildingId: t.integer().references(() => buildingTable.id, {
		onDelete: 'cascade',
		onUpdate: 'cascade',
	}),
}))
