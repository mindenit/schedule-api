import { pgTable } from 'drizzle-orm/pg-core'
import { baseTableAttrs } from '../utils.js'

export const auditoriumTypeTable = pgTable('auditorium_type', (t) => ({
	id: baseTableAttrs.id,
	name: t.varchar({ length: 255 }).notNull(),
}))
