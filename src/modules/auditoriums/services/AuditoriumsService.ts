import type { DatabaseClient } from '@/core/types/index.js'
import type { CistAuditoriumsOutput } from '@/core/types/proxy.js'
import { buildingTable } from '@/db/schema/building.js'
import {
	auditoriumTable,
	auditoriumTypeTable,
	auditoriumTypeToAuditoriumTable,
} from '@/db/schema/index.js'
import type { Redis } from 'ioredis'
import type { AuditoriumsInjectableDependencies } from '../types/index.js'

export class AuditoriumsService {
	private readonly db: DatabaseClient
	private readonly cache: Redis

	constructor({ db, cache }: AuditoriumsInjectableDependencies) {
		this.db = db.client
		this.cache = cache
	}

	async processParsedJSON(data: CistAuditoriumsOutput): Promise<void> {
		const { buildings, auditoriums, auditoriumTypes } = data

		for (const building of buildings) {
			const key = this.getBuildingKey(building.id)

			const isExists = await this.cache.get(key)

			if (isExists) {
				continue
			}

			await this.db.insert(buildingTable).values(building)
			await this.cache.set(key, 'exists')
		}

		for (const auditorium of auditoriums) {
			const key = this.getAuditoriumKey(auditorium.id)

			const isExists = await this.cache.get(key)

			if (isExists) {
				continue
			}

			await this.db.insert(auditoriumTable).values(auditorium)
			await this.cache.set(key, 'exists')
		}

		for (const type of auditoriumTypes) {
			const key = this.getAuditoriumTypeKey(type.id)

			const isExists = await this.cache.get(key)

			if (isExists) {
				continue
			}

			await this.db.transaction(async (tx) => {
				await tx.insert(auditoriumTypeTable).values(type)
				await tx.insert(auditoriumTypeToAuditoriumTable).values({
					auditoriumId: type.auditoriumId,
					auditoriumTypeId: type.id,
				})
			})

			await this.cache.set(key, 'exists')
		}
	}

	private getAuditoriumKey(auditoriumId: number) {
		return `auditoriums:${auditoriumId}`
	}

	private getAuditoriumTypeKey(typeId: number) {
		return `auditorium_types:${typeId}`
	}

	private getBuildingKey(buildingId: string): string {
		return `buildings:${buildingId}`
	}
}
