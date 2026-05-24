import { Module } from '@nestjs/common'
import { CistEventsProcessor } from './implementations/events/events.cist-processor'
import { CistGroupsProcessor } from './implementations/groups/groups.cist-processor'
import { CistAuditoriumProcessor } from './implementations/auditoriums/auditoriums.cist-processor'
import { CistTeachersProcessor } from './implementations/teachers/teachers.cist-processor'

@Module({
	providers: [
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
