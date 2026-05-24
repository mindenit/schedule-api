import { pgTable } from 'drizzle-orm/pg-core'
import { baseTableAttrs } from '../utils'

export const subjectTable = pgTable('subject', (t) => ({
	id: baseTableAttrs.id,
	name: t.varchar({ length: 255 }).notNull(),
	brief: t.varchar({ length: 100 }).notNull(),
}))
