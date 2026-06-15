import { Module } from '@nestjs/common'
import { CistEventsProcessor } from './implementations/events/events.cist-processor'
import { CistGroupsProcessor } from './implementations/groups/groups.cist-processor'
import { CistAuditoriumProcessor } from './implementations/auditoriums/auditoriums.cist-processor'
import { CistTeachersProcessor } from './implementations/teachers/teachers.cist-processor'
import { CacheModule } from 'src/components/cache/cache.module'
import { DatabaseModule } from 'src/components/database/database.module'
import { CistAuditoriumParser } from './implementations/auditoriums/auditoriums.cist-parser'
import { CistGroupsParser } from './implementations/groups/groups.cist-parser'
import { CistEventsParser } from './implementations/events/events.cist-parser'
import { CistTeachersParser } from './implementations/teachers/teachers.cist-parser'
import { CistCrawlerModule } from 'src/components/cist-crawler/cist-crawler.module'
import { LoggerModule } from 'src/components/logger/logger.module'

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
