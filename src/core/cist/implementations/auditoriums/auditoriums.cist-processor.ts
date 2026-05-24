import { Inject, Injectable } from '@nestjs/common'
import { Result } from 'better-result'
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import Redis from 'ioredis'
import { Auditorium } from 'src/core/cist/dtos/auditorium.dto'
import { CistCrawlerException } from 'src/common/exceptions/cist-crawler.exception'
import { PromiseResult } from 'src/common/types'
import { CACHE_CONNECTION_TOKEN } from 'src/components/cache/di-tokens'
import { DATABASE_CONNECTION_TOKEN } from 'src/components/database/di-tokens'
import {
	auditoriumTable,
	auditoriumTypeTable,
	buildingTable,
} from 'src/db/schema'
import { CistAbstractProcessor, UploadJob } from '../../abstract.cist-processor'
import { CistAuditoriumParser } from './auditoriums.cist-parser'

type CistAuditoriumProcessorException = CistCrawlerException

@Injectable()
export class CistAuditoriumProcessor extends CistAbstractProcessor<
	Auditorium[],
	CistAuditoriumProcessorException
> {
	constructor(
		@Inject(DATABASE_CONNECTION_TOKEN)
		db: PostgresJsDatabase,
		@Inject(CACHE_CONNECTION_TOKEN)
		cache: Redis,
		private readonly cistAuditoriumParser: CistAuditoriumParser,
	) {
		super(db, cache)
	}

	async process(): PromiseResult<
		Auditorium[],
		CistAuditoriumProcessorException
	> {
		const parseResult = await this.cistAuditoriumParser.parse()

		if (parseResult.isErr()) {
			return Result.err(parseResult.error)
		}

		const { auditoriums, auditoriumTypes, buildings } = parseResult.value

		const jobs: UploadJob[] = [
			{
				entities: buildings,
				table: buildingTable,
				computeKey: (id) => `buildings:${id}`,
			},
			{
				entities: auditoriums,
				table: auditoriumTable,
				computeKey: (id) => `auditoriums:${id}`,
			},
			{
				entities: auditoriumTypes,
				table: auditoriumTypeTable,
				computeKey: (id) => `auditoriumTypes:${id}`,
			},
		]

		for (const job of jobs) {
			await this.uploadEntities(job)
		}

		return Result.ok(auditoriums)
	}
}
