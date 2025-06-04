import { pgTable } from 'drizzle-orm/pg-core'
import { baseTableAttrs } from '../utils.js'

const { id, fullName, shortName } = baseTableAttrs

export const facultyTable = pgTable('faculty', {
	id,
	fullName,
	shortName,
})
