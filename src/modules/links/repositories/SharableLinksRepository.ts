import type { Redis } from 'ioredis'
import type {
	LinksInjectableDependencies,
	SharableLinksRepository,
} from '../types/index.js'
import { randomUUID } from 'node:crypto'
import { HOUR } from '@/core/constants/time.js'

export class SharableLinkRepositoryImpl implements SharableLinksRepository {
	private readonly cache: Redis

	constructor({ cache }: LinksInjectableDependencies) {
		this.cache = cache
	}

	async createOne(userId: string, links: string[]) {
		const id = randomUUID()
		const sharableKey = SharableLinkRepositoryImpl.getKey(id)

		for (const link of links) {
			const linkKey = `${userId}:links:${link}`

			await this.cache.lpush(sharableKey, linkKey)
		}

		this.cache.expire(sharableKey, 10 * HOUR)

		return id
	}

	private static getKey(id: string): string {
		return `sharable-links:${id}`
	}
}
