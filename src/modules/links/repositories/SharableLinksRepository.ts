import type { Redis } from 'ioredis'
import type {
	LinksInjectableDependencies,
	SharableLinksRepository,
} from '../types/index.js'
import { randomUUID } from 'node:crypto'
import { HOUR } from '@/core/constants/time.js'
import type { Maybe } from '@/core/types/common.js'
import { LINK_SCHEMA, type Link, type SharableLink } from '../schemas/index.js'

export class SharableLinkRepositoryImpl implements SharableLinksRepository {
	private readonly cache: Redis

	constructor({ cache }: LinksInjectableDependencies) {
		this.cache = cache
	}

	async findOne(id: string): Promise<Maybe<SharableLink>> {
		const key = SharableLinkRepositoryImpl.getKey(id)
		const links: Link[] = []

		const rawLinks = await this.cache.lrange(key, 0, -1)

		if (rawLinks.length === 0) {
			return null
		}

		for (const key of rawLinks) {
			const [label, url, type, subjectId, id, userId] = await this.cache.hmget(
				key,
				'label',
				'url',
				'type',
				'subjectId',
				'id',
				'userId',
			)

			const link = {
				label,
				url,
				type,
				subjectId: Number(subjectId),
				id,
				userId,
			}

			const { success, data } = LINK_SCHEMA.safeParse(link)

			if (!success) {
				continue
			}

			links.push(data)
		}

		const sharableLink = {
			id,
			links,
		} satisfies SharableLink

		return sharableLink
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
