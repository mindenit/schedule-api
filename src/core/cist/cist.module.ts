import { Module } from '@nestjs/common'
import { CacheModule } from 'src/components/cache/cache.module'
import { CistCrawlerModule } from 'src/components/cist-crawler/cist-crawler.module'
import { DatabaseModule } from 'src/components/database/database.module'
import { LoggerModule } from 'src/components/logger/logger.module'

import { CistAuditoriumParser } from './implementations/auditoriums/auditoriums.cist-parser'
import { CistAuditoriumProcessor } from './implementations/auditoriums/auditoriums.cist-processor'
import { CistEventsParser } from './implementations/events/events.cist-parser'
import { CistEventsProcessor } from './implementations/events/events.cist-processor'
import { CistGroupsParser } from './implementations/groups/groups.cist-parser'
import { CistGroupsProcessor } from './implementations/groups/groups.cist-processor'
import { CistTeachersParser } from './implementations/teachers/teachers.cist-parser'
import { CistTeachersProcessor } from './implementations/teachers/teachers.cist-processor'

@Module({
	imports: [CacheModule, CistCrawlerModule, DatabaseModule, LoggerModule],
	providers: [
		CistAuditoriumParser,
		CistEventsParser,
		CistGroupsParser,
		CistTeachersParser,
		CistAuditoriumProcessor,
		CistEventsProcessor,
		CistGroupsProcessor,
		CistTeachersProcessor,
	],
	exports: [
		CistAuditoriumProcessor,
		CistEventsProcessor,
		CistGroupsProcessor,
		CistTeachersProcessor,
	],
})
export class CistModule {}
