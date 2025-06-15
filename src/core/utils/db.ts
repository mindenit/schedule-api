import { buildingTable } from '@/db/schema/building.js'
import type { DatabaseClient } from '../types/deps.js'

export const isDbEmpty = async (db: DatabaseClient): Promise<boolean> => {
	const rows = await db.select().from(buildingTable).limit(1)

	return rows.length === 0
}
