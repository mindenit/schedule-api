import { pgTable } from 'drizzle-orm/pg-core'
import { baseTableAttrs } from '../utils.js'

const { id, fullName } = baseTableAttrs

export const subjectTable = pgTable('subject', (t) => ({
	id,
	name: fullName,
	brief: t.varchar({ length: 100 }).notNull(),
}))
