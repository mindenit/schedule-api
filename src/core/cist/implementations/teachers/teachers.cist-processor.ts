import { Inject, Injectable } from '@nestjs/common'
import { Result } from 'better-result'
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import Redis from 'ioredis'
import { CistCrawlerException } from 'src/common/exceptions/cist-crawler.exception'
import { PromiseResult } from 'src/common/types'
import { CACHE_CONNECTION_TOKEN } from 'src/components/cache/di-tokens'
import { DATABASE_CONNECTION_TOKEN } from 'src/components/database/di-tokens'
import { departmentTable, facultyTable, teacherTable } from 'src/db/schema'
import { CistAbstractProcessor, UploadJob } from '../../abstract.cist-processor'
import { CistTeachersParser } from './teachers.cist-parser'
import { Teacher } from '../../dtos/teacher.dto'

// Types
type CistTeachersProcessorException = CistCrawlerException

@Injectable()
export class CistTeachersProcessor extends CistAbstractProcessor<
	Teacher[],
	CistTeachersProcessorException
> {
	constructor(
		@Inject(DATABASE_CONNECTION_TOKEN)
		db: PostgresJsDatabase,
		@Inject(CACHE_CONNECTION_TOKEN)
		cache: Redis,
		private readonly cistTeachersParser: CistTeachersParser,
	) {
		super(db, cache)
	}

	async process(): PromiseResult<Teacher[], CistTeachersProcessorException> {
		const parseResult = await this.cistTeachersParser.parse()

		if (parseResult.isErr()) {
			return Result.err(parseResult.error)
		}

		const { teachers, faculties, departments } = parseResult.value

		const jobs: UploadJob[] = [
			{
				entities: faculties,
				table: facultyTable,
				computeKey: (id) => `faculties:${id}`,
			},
			{
				entities: departments,
				table: departmentTable,
				computeKey: (id) => `departments:${id}`,
			},
			{
				entities: teachers,
				table: teacherTable,
				computeKey: (id) => `teachers:${id}`,
			},
		]

		for (const job of jobs) {
			await this.uploadEntities(job)
		}

		return Result.ok(teachers)
	}
}
