import { integer, varchar } from 'drizzle-orm/pg-core'

const referencialIntegrityOptions = {
	onDelete: 'cascade',
	onUpdate: 'cascade',
} as const

const baseTableAttrs = {
	id: integer().primaryKey().notNull(),
	fullName: varchar({ length: 255 }).notNull(),
	shortName: varchar({ length: 40 }).notNull(),
}

export { baseTableAttrs, referencialIntegrityOptions }
