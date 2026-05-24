import { pgTable } from 'drizzle-orm/pg-core'
import { baseTableAttrs } from '../utils'

const { id, fullName, shortName } = baseTableAttrs

export const facultyTable = pgTable('faculty', {
	id,
	fullName,
	shortName,
})
