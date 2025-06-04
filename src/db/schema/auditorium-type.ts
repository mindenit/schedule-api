import { pgTable } from 'drizzle-orm/pg-core'
import { baseTableAttrs } from '../utils.js'

const { id, fullName } = baseTableAttrs

export const auditoriumTypeTable = pgTable('auditorium_type', {
	id,
	name: fullName,
})
