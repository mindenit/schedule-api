import { pgTable } from 'drizzle-orm/pg-core'
import { baseTableAttrs } from '../utils.js'
import { buildingTable } from './building.js'

const { id, fullName } = baseTableAttrs

export const auditoriumTable = pgTable('auditorium', (t) => ({
	id,
	name: fullName,
	floor: t.smallint(),
	hasPower: t.boolean(),
	buildingId: t.varchar().references(() => buildingTable.id, {
		onDelete: 'cascade',
		onUpdate: 'cascade',
	}),
}))
