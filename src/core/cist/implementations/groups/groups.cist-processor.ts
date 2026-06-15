import { Inject, Injectable } from '@nestjs/common'
import { Result } from 'better-result'
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { CistCrawlerException } from 'src/common/exceptions/cist-crawler.exception'
import { PromiseResult } from 'src/common/types'
import { DATABASE_CONNECTION_TOKEN } from 'src/components/database/di-tokens'
import { Group } from 'src/core/cist/dtos/group.dto'
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
		private readonly cistGroupsParser: CistGroupsParser,
	) {
		super(db)
	}

	async process(): PromiseResult<Group[], CistGroupsProcessorException> {
		const parseResult = await this.cistGroupsParser.parse()

		if (parseResult.isErr()) {
			return Result.err(parseResult.error)
		}

		const { groups, faculties, specialities, directions } = parseResult.value

		const jobs: UploadJob[] = [
			{ entities: faculties, table: facultyTable },
			{ entities: directions, table: directionTable },
			{ entities: specialities, table: specialityTable },
			{ entities: groups, table: academicGroupTable },
		]

		for (const job of jobs) {
			await this.uploadEntities(job)
		}

		return Result.ok(groups)
	}
}
