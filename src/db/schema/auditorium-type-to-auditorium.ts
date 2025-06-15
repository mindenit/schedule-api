import { integer, pgTable, primaryKey } from 'drizzle-orm/pg-core'
import { auditoriumTable } from './auditorium.js'
import { auditoriumTypeTable } from './auditorium-type.js'
import { referencialIntegrityOptions } from '../utils.js'

export const auditoriumTypeToAuditoriumTable = pgTable(
	'auditorium_type_to_auditorium',
	{
		auditoriumId: integer().references(
			() => auditoriumTable.id,
			referencialIntegrityOptions,
		),
		auditoriumTypeId: integer().references(
			() => auditoriumTypeTable.id,
			referencialIntegrityOptions,
		),
	},
	(t) => [primaryKey({ columns: [t.auditoriumId, t.auditoriumTypeId] })],
)
