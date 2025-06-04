import { pgTable } from 'drizzle-orm/pg-core'
import { baseTableAttrs } from '../utils.js'

const { id, fullName, shortName } = baseTableAttrs

export const subjectTable = pgTable('subject', {
	id,
	fullName,
	shortName,
})
