import { randomUUID } from 'node:crypto'
import {
	LINK_SCHEMA,
	type CREATE_LINK,
	type Link,
	type UPDATE_LINK,
} from '../schemas/index.js'
import type {
	LinksInjectableDependencies,
	LinksRepository,
} from '../types/index.js'
import { Redis } from 'ioredis'
import type { Maybe } from '@/core/types/common.js'
import { scanKeys } from '@/core/utils/redis.js'

export class LinksRepositoryImpl implements LinksRepository {
	private readonly cache: Redis

	constructor({ cache }: LinksInjectableDependencies) {
		this.cache = cache
	}

	async findOne(id: string, userId: string): Promise<Maybe<Link>> {
		const key = LinksRepositoryImpl.getKey(userId, id)

		const [label, url, type, subjectId] = await this.cache.hmget(
			key,
			'label',
			'url',
			'type',
			'subjectId',
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
			return null
		}

		return data
	}

	async findMany(pattern: string): Promise<Link[]> {
		const links: Link[] = []
		const keys = await scanKeys(this.cache, pattern)

		const pipeline = this.cache.pipeline()

		for (const key of keys) {
			pipeline.hmget(key, 'id', 'label', 'url', 'type', 'subjectId', 'userId')
		}

		const results = await pipeline.exec()

		if (!results) {
			return []
		}

		for (const result of results) {
			const [error, values] = result

			if (error) {
				continue
			}

			const [id, label, url, type, subjectId, userId] = values as string[]

			const link = {
				id,
				label,
				url,
				type,
				subjectId: Number(subjectId),
				userId,
			}

			const { success, data } = LINK_SCHEMA.safeParse(link)

			if (!success) {
				continue
			}

			links.push(data)
		}

		return links
	}

	async createOne(userId: string, data: CREATE_LINK): Promise<Link> {
		const id = randomUUID()
		const key = LinksRepositoryImpl.getKey(userId, id)

		const link = {
			id,
			userId,
			...data,
		} satisfies Link

		await this.cache.hmset(key, link)

		return link
	}

	async updateOne(
		id: string,
		userId: string,
		data: UPDATE_LINK,
	): Promise<void> {
		const key = LinksRepositoryImpl.getKey(userId, id)

		await this.cache.hmset(key, data)
	}

	async deleteOne(id: string, userId: string): Promise<void> {
		const key = LinksRepositoryImpl.getKey(userId, id)

		await this.cache.del(key)
	}

	private static getKey(userId: string, id: string): string {
		return `${userId}:links:${id}`
	}
}
