import { Inject, Injectable } from '@nestjs/common'
import { Result } from 'better-result'
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { CistCrawlerException } from 'src/common/exceptions/cist-crawler.exception'
import { PromiseResult } from 'src/common/types'
import { DATABASE_CONNECTION_TOKEN } from 'src/components/database/di-tokens'
import { Auditorium } from 'src/core/cist/dtos/auditorium.dto'
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
		private readonly cistAuditoriumParser: CistAuditoriumParser,
	) {
		super(db)
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
			{ entities: buildings, table: buildingTable },
			{ entities: auditoriums, table: auditoriumTable },
			{ entities: auditoriumTypes, table: auditoriumTypeTable },
		]

		for (const job of jobs) {
			await this.uploadEntities(job)
		}

		return Result.ok(auditoriums)
	}
}
