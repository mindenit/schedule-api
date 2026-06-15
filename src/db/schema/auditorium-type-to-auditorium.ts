import { integer, pgTable, primaryKey } from 'drizzle-orm/pg-core'

import { referencialIntegrityOptions } from '../utils'
import { auditoriumTable } from './auditorium'
import { auditoriumTypeTable } from './auditorium-type'

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
