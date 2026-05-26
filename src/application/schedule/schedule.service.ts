import { setTimeout } from 'node:timers/promises'
import { Inject, Injectable, Logger } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'
import Redis from 'ioredis'
import {
	HEALTH_CHECK_KEY,
	IS_UPDATE_IN_PROGRESS_KEY,
	SYSTEM_HEALTH_STATUS,
	UPDATE_STATUS,
} from 'src/common/constants/health-status'
import { CACHE_CONNECTION_TOKEN } from 'src/components/cache/di-tokens'
import { CistAuditoriumProcessor } from 'src/core/cist/implementations/auditoriums/auditoriums.cist-processor'
import { SCHEDULE_TYPE } from 'src/core/cist/implementations/events/events.cist-parser'
import { CistEventsProcessor } from 'src/core/cist/implementations/events/events.cist-processor'
import { CistGroupsProcessor } from 'src/core/cist/implementations/groups/groups.cist-processor'
import { CistTeachersProcessor } from 'src/core/cist/implementations/teachers/teachers.cist-processor'
import { WebhooksService } from 'src/components/webhooks/webhooks.service'
import { DATABASE_CONNECTION_TOKEN } from 'src/components/database/di-tokens'
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { academicGroupTable } from 'src/db/schema'

// Constants
const CIST_DELAY_MS = 8_000

@Injectable()
export class ScheduleService {
	private readonly logger = new Logger(ScheduleService.name)

	constructor(
		@Inject(DATABASE_CONNECTION_TOKEN)
		private readonly db: PostgresJsDatabase,
		@Inject(CACHE_CONNECTION_TOKEN)
		private readonly cache: Redis,
		private readonly auditoriumsProcessor: CistAuditoriumProcessor,
		private readonly eventsProcessor: CistEventsProcessor,
		private readonly groupsProcessor: CistGroupsProcessor,
		private readonly teachersProcessor: CistTeachersProcessor,
		private readonly webhookService: WebhooksService,
	) {}

	@Cron('0 */12 * * *', {
		name: 'cist-postman',
		timeZone: 'Europe/Kyiv',
	})
	async processSchedule() {
		await Promise.all([
			this.cache.set(HEALTH_CHECK_KEY, SYSTEM_HEALTH_STATUS.UPDATING),
			this.cache.set(IS_UPDATE_IN_PROGRESS_KEY, UPDATE_STATUS.IN_PROGRESS),
		])

		this.logger.log('Start CIST Postman')

		const [auditoriumsResult, groupsResult, teachersResult] = await Promise.all(
			[
				this.auditoriumsProcessor.process(),
				this.groupsProcessor.process(),
				this.teachersProcessor.process(),
			],
		)

		if (auditoriumsResult.isErr()) {
			const error = auditoriumsResult.error
			const errMessage = `:warning: Auditoriums processing failed!\n\`\`\`${error.cause}\`\`\``

			await this.webhookService.ping(errMessage)
		}

		if (teachersResult.isErr()) {
			const error = teachersResult.error
			const errMessage = `:warning: Teachers processing failed!\n\`\`\`${error.cause}\`\`\``

			await this.webhookService.ping(errMessage)
		}

		if (groupsResult.isErr()) {
			const error = groupsResult.error
			const errMessage = `:warning: Groups processing failed, filling schedule for existing data!\n\`\`\`${error.cause}\`\`\``

			await this.webhookService.ping(errMessage)
		}

		this.logger.log('Start filling schedule')

		const existingGroups = await this.db.select().from(academicGroupTable)
		const groups = groupsResult.unwrapOr(existingGroups)
		const totalGroups = groups.length

		for (let i = 0; i < totalGroups; i++) {
			const group = groups.at(i)!

			this.logger.log(
				`Processing group ${i + 1}/${totalGroups} with id ${group.id}`,
			)

			await this.eventsProcessor.process({
				id: group.id,
				type: SCHEDULE_TYPE.GROUP,
			})
			await setTimeout(CIST_DELAY_MS)
		}

		await Promise.all([
			this.eventsProcessor.removeExtraEvents(),
			this.cache.set(HEALTH_CHECK_KEY, SYSTEM_HEALTH_STATUS.HEALTHY),
			this.cache.set(IS_UPDATE_IN_PROGRESS_KEY, UPDATE_STATUS.FINISHED),
		])

		this.logger.log('Job completed sucessfully')
	}
}
