import type { Redis } from 'ioredis'
import type {
	LinksInjectableDependencies,
	SharableLinksRepository,
} from '../types/index.js'
import { randomUUID } from 'node:crypto'
import { HOUR } from '@/core/constants/time.js'
import type { Maybe } from '@/core/types/common.js'

export class SharableLinkRepositoryImpl implements SharableLinksRepository {
	private readonly cache: Redis

	constructor({ cache }: LinksInjectableDependencies) {
		this.cache = cache
	}

	async findOne(id: string): Promise<Maybe<string>> {
		const key = SharableLinkRepositoryImpl.getKey(id)
		const links = await this.cache.lrange(key, 0, -1)

		if (links.length === 0) {
			return null
		}

		return links[0]
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
