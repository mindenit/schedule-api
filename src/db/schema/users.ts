import { pgTable, varchar } from 'drizzle-orm/pg-core'
import { baseTableAttrs } from '../utils.js'

export const userTable = pgTable('user', {
	...baseTableAttrs,
	name: varchar().unique().notNull(),
})
