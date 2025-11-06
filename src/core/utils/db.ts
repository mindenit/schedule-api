import { buildingTable } from '@/db/schema/building.js'
import type { DatabaseClient } from '../types/deps.js'
import type { Redis } from 'ioredis'
import {
	IS_UPDATE_IN_PROGRESS_KEY,
	UPDATE_STATUS,
} from '../constants/health.js'

const isDbEmpty = async (db: DatabaseClient): Promise<boolean> => {
	const rows = await db.select().from(buildingTable).limit(1)

	return rows.length === 0
}

const isScheduleUpdating = async (cache: Redis): Promise<boolean> => {
	const status = await cache.get(IS_UPDATE_IN_PROGRESS_KEY)

	if (!status) {
		return false
	}

	return status === UPDATE_STATUS.IN_PROGRESS
}

export { isDbEmpty, isScheduleUpdating }
