import { integer, varchar } from 'drizzle-orm/pg-core'

export const referencialIntegrityOptions = {
	onDelete: 'cascade',
	onUpdate: 'cascade',
} as const

export const baseTableAttrs = {
	id: integer().primaryKey().notNull(),
	fullName: varchar({ length: 255 }).notNull(),
	shortName: varchar({ length: 40 }).notNull(),
}
