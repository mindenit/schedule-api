import { check, pgTable } from 'drizzle-orm/pg-core'
import { baseTableAttrs } from '../utils.js'
import { sql } from 'drizzle-orm'
import { auditoriumTable } from './auditorium.js'
import { eventTypeEnum } from './event-type-enum.js'

const { id } = baseTableAttrs

export const eventTable = pgTable(
	'event',
	(t) => ({
		id,
		startTime: t.timestamp(),
		endTime: t.timestamp(),
		numberPair: t.smallint(),
		type: eventTypeEnum(),
		auditoriumId: t.integer().references(() => auditoriumTable.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
	}),
	(t) => [check('start_before_end', sql`${t.startTime} < ${t.endTime}`)],
)
