import { integer, pgTable, primaryKey } from 'drizzle-orm/pg-core'
import { auditoriumTable } from './auditorium.js'
import { auditoriumTypeTable } from './auditorium-type.js'

export const auditoriumTypeToAuditoriumTable = pgTable(
	'auditorium_type_to_auditorium',
	{
		auditoriumId: integer().references(() => auditoriumTable.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
		auditoriumTypeId: integer().references(() => auditoriumTypeTable.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
	},
	(t) => [primaryKey({ columns: [t.auditoriumId, t.auditoriumTypeId] })],
)
