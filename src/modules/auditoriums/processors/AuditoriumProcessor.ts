import { RedisKeyBuilder } from '@/core/builders/RedisKeyBulder.js'
import type { CistParser, CistProcessor } from '@/core/types/cist.js'
import type { DatabaseClient } from '@/core/types/deps.js'
import type { CistAuditoriumsOutput } from '@/core/types/proxy.js'
import {
	auditoriumTable,
	auditoriumTypeTable,
	auditoriumTypeToAuditoriumTable,
	buildingTable,
} from '@/db/schema/index.js'
import type { Auditorium } from '@/db/types.js'
import type { Redis } from 'ioredis'
import type { AuditoriumsInjectableDependencies } from '../types/index.js'

export class AuditoriumProcessorImpl implements CistProcessor<Auditorium[]> {
	private readonly db: DatabaseClient
	private readonly cache: Redis
	private readonly parser: CistParser<CistAuditoriumsOutput>

	constructor({
		db,
		cache,
		auditoriumsParser,
	}: AuditoriumsInjectableDependencies) {
		this.db = db.client
		this.cache = cache
		this.parser = auditoriumsParser
	}

	async process(): Promise<Auditorium[]> {
		try {
			const data = await this.parser.parse()

			if (!data) {
				return []
			}

			const { buildings, auditoriums, auditoriumTypes } = data

			for (const building of buildings) {
				const key = RedisKeyBuilder.buildingKey(building.id)

				const isExists = await this.cache.get(key)

				if (isExists) {
					continue
				}

				await this.db.insert(buildingTable).values(building)
				await this.cache.set(key, 'exists')
			}

			for (const auditorium of auditoriums) {
				const key = RedisKeyBuilder.auditoriumKey(auditorium.id)

				const isExists = await this.cache.get(key)

				if (isExists) {
					continue
				}

				await this.db.insert(auditoriumTable).values(auditorium)
				await this.cache.set(key, 'exists')
			}

			for (const type of auditoriumTypes) {
				const key = RedisKeyBuilder.auditoriumTypeKey(type.id)

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

			return data.auditoriums
		} catch (e: unknown) {
			if (e instanceof Error && e.message.includes('[AuditoriumsParser]')) {
				throw new Error(e.message)
			}

			const message = `[AuditoriumsProcessor] Failed to process data: ${e instanceof Error ? e.message : 'Unknown error'}`

			throw new Error(message)
		}
	}
}
