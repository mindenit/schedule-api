import { pgTable } from 'drizzle-orm/pg-core'
import { baseTableAttrs } from '../utils.js'

const { fullName, shortName } = baseTableAttrs

export const buildingTable = pgTable('building', (t) => ({
	id: t.varchar().primaryKey(),
	fullName,
	shortName,
}))
