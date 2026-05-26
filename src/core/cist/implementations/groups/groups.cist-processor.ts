import { Inject, Injectable } from '@nestjs/common'
import { Result } from 'better-result'
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import Redis from 'ioredis'
import { Group } from 'src/core/cist/dtos/group.dto'
import { CistCrawlerException } from 'src/common/exceptions/cist-crawler.exception'
import { PromiseResult } from 'src/common/types'
import { CACHE_CONNECTION_TOKEN } from 'src/components/cache/di-tokens'
import { DATABASE_CONNECTION_TOKEN } from 'src/components/database/di-tokens'
import {
	academicGroupTable,
	directionTable,
	facultyTable,
	specialityTable,
} from 'src/db/schema'
import { CistAbstractProcessor, UploadJob } from '../../abstract.cist-processor'
import { CistGroupsParser } from './groups.cist-parser'

// Types
type CistGroupsProcessorException = CistCrawlerException

@Injectable()
export class CistGroupsProcessor extends CistAbstractProcessor<
	Group[],
	CistGroupsProcessorException
> {
	constructor(
		@Inject(DATABASE_CONNECTION_TOKEN)
		db: PostgresJsDatabase,
		@Inject(CACHE_CONNECTION_TOKEN)
		cache: Redis,
		private readonly cistGroupsParser: CistGroupsParser,
	) {
		super(db, cache)
	}

	async process(): PromiseResult<Group[], CistGroupsProcessorException> {
		const parseResult = await this.cistGroupsParser.parse()

		if (parseResult.isErr()) {
			return Result.err(parseResult.error)
		}

		const { groups, faculties, specialities, directions } = parseResult.value

		const jobs: UploadJob[] = [
			{
				entities: faculties,
				table: facultyTable,
				computeKey: (id) => `faculties:${id}`,
			},
			{
				entities: directions,
				table: directionTable,
				computeKey: (id) => `directions:${id}`,
			},
			{
				entities: specialities,
				table: specialityTable,
				computeKey: (id) => `specialities:${id}`,
			},
			{
				entities: groups,
				table: academicGroupTable,
				computeKey: (id) => `groups:${id}`,
			},
		]

		for (const job of jobs) {
			await this.uploadEntities(job)
		}

		return Result.ok(groups)
	}
}
