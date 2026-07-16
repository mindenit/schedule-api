import { randomUUID } from 'node:crypto'

import { HttpStatus, Inject, Injectable } from '@nestjs/common'
import type { Redis } from 'ioredis'
import { AppException } from 'src/common/exceptions/app.exception'
import { LinksErrorCodes } from 'src/common/exceptions/error-codes'
import { CACHE_CONNECTION_TOKEN } from 'src/components/cache/di-tokens'

import type { CreateSharableLink, SharableLink } from './links.schema'

/** 24 hours in seconds — TTL for sharable link bundles */
const SHARABLE_LINK_TTL_SECONDS = 24 * 60 * 60

@Injectable()
export class LinksRepository {
	constructor(
		@Inject(CACHE_CONNECTION_TOKEN)
		private readonly cache: Redis,
	) {}

	async findSharableLink(id: string): Promise<SharableLink | null> {
		const raw = await this.cache.get(this.sharableKey(id))

		if (!raw) {
			return null
		}

		return { id, links: JSON.parse(raw) as CreateSharableLink }
	}

	async createSharableLink(data: CreateSharableLink): Promise<string> {
		const id = randomUUID()

		await this.cache.set(
			this.sharableKey(id),
			JSON.stringify(data),
			'EX',
			SHARABLE_LINK_TTL_SECONDS,
		)

		return id
	}

	async assertSharableLinkExists(id: string): Promise<void> {
		const exists = await this.cache.exists(this.sharableKey(id))

		if (!exists) {
			throw new AppException(
				LinksErrorCodes.SHARABLE_LINK_NOT_FOUND,
				'Sharable link not found or has expired',
				HttpStatus.NOT_FOUND,
			)
		}
	}

	private sharableKey(id: string): string {
		return `sharable-links:${id}`
	}
}
