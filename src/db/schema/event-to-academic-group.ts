import { index, pgTable, primaryKey } from 'drizzle-orm/pg-core'

import { referencialIntegrityOptions } from '../utils'
import { academicGroupTable } from './academic-group'
import { eventTable } from './event'

export const eventToAcademicGroupTable = pgTable(
	'event_to_academic_group',
	(t) => ({
		eventId: t
			.integer()
			.notNull()
			.references(() => eventTable.id, referencialIntegrityOptions),
		groudId: t
			.integer()
			.notNull()
			.references(() => academicGroupTable.id, referencialIntegrityOptions),
	}),
	(t) => [
		primaryKey({ columns: [t.eventId, t.groudId] }),
		// groudId is the second column of the composite PK, not independently
		// indexed -- reverse lookups (findGroupAuditoriums/Subjects/Teachers,
		// the hasEvents=true filter) all query by groudId alone.
		index('event_to_academic_group_group_id_idx').on(t.groudId),
	],
)
