import { sql } from 'drizzle-orm'
import { bigint, check, pgTable } from 'drizzle-orm/pg-core'
import { auditoriumTable } from './auditorium.js'
import { eventTypeEnum } from './event-type-enum.js'
import { subjectTable } from './subject.js'
import { referencialIntegrityOptions } from '../utils.js'

export const eventTable = pgTable(
	'event',
	(t) => ({
		id: bigint({ mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
		startTime: t.timestamp(),
		endTime: t.timestamp(),
		numberPair: t.smallint(),
		type: eventTypeEnum(),
		auditoriumId: t.integer().references(() => auditoriumTable.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
		subjectId: t
			.integer()
			.references(() => subjectTable.id, referencialIntegrityOptions),
	}),
	(t) => [check('start_before_end', sql`${t.startTime} < ${t.endTime}`)],
)
