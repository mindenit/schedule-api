import { setTimeout } from 'node:timers/promises'

import { Inject, Injectable } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import Redis from 'ioredis'
import {
	HEALTH_CHECK_KEY,
	IS_UPDATE_IN_PROGRESS_KEY,
	SYSTEM_HEALTH_STATUS,
	UPDATE_STATUS,
} from 'src/common/constants/health-status'
import { CistCrawlerException } from 'src/common/exceptions/cist-crawler.exception'
import { stringifyErrorCause } from 'src/common/utils/error-handling'
import { CACHE_CONNECTION_TOKEN } from 'src/components/cache/di-tokens'
import { DATABASE_CONNECTION_TOKEN } from 'src/components/database/di-tokens'
import { LoggerService } from 'src/components/logger/logger.service'
import { WebhooksService } from 'src/components/webhooks/webhooks.service'
import { CistAuditoriumProcessor } from 'src/core/cist/implementations/auditoriums/auditoriums.cist-processor'
import { SCHEDULE_TYPE } from 'src/core/cist/implementations/events/events.cist-parser'
import { CistEventsProcessor } from 'src/core/cist/implementations/events/events.cist-processor'
import { CistGroupsProcessor } from 'src/core/cist/implementations/groups/groups.cist-processor'
import { CistTeachersProcessor } from 'src/core/cist/implementations/teachers/teachers.cist-processor'
import { academicGroupTable } from 'src/db/schema'

import { SCHEDULE_ENTITY, ScheduleEntity } from './schedule.constants'

// Constants
const LOG_PREFIX = 'schedule-service'
const CIST_DELAY_MS = 8_000

@Injectable()
export class ScheduleService {
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
		private readonly logger: LoggerService,
	) {}

	@Cron('0 */12 * * *', {
		name: 'cist-postman',
		timeZone: 'Europe/Kyiv',
	})
	async processSchedule() {
		const runId = Date.now()

		await Promise.all([
			this.cache.set(HEALTH_CHECK_KEY, SYSTEM_HEALTH_STATUS.UPDATING),
			this.cache.set(IS_UPDATE_IN_PROGRESS_KEY, UPDATE_STATUS.IN_PROGRESS),
		])

		this.logger.log('Start CIST Postman')

		// Run sequentially instead of in parallel to reduce peak CPU/DB pressure
		// during a seed run and keep the event loop responsive for HTTP handlers.
		const auditoriumsResult = await this.auditoriumsProcessor.process()
		await new Promise(setImmediate)
		const groupsResult = await this.groupsProcessor.process()
		await new Promise(setImmediate)
		const teachersResult = await this.teachersProcessor.process()
		await new Promise(setImmediate)

		if (auditoriumsResult.isErr()) {
			await this.logProcessingException(
				SCHEDULE_ENTITY.AUDITORIUM,
				auditoriumsResult.error,
			)
		}

		if (teachersResult.isErr()) {
			await this.logProcessingException(
				SCHEDULE_ENTITY.AUDITORIUM,
				teachersResult.error,
			)
		}

		if (groupsResult.isErr()) {
			await this.logProcessingException(
				SCHEDULE_ENTITY.AUDITORIUM,
				groupsResult.error,
			)
		}

		this.logger.log('Start filling schedule')

		const existingGroups = await this.db.select().from(academicGroupTable)
		const groups = groupsResult.unwrapOr(existingGroups)
		const totalGroups = groups.length
		const failedGroupIds: number[] = []

		for (let i = 0; i < totalGroups; i++) {
			const group = groups.at(i)!

			this.logger.log(`${LOG_PREFIX}|processing-group-schedule`, {
				groupId: group.id,
				currentIndex: i + 1,
				totalGroups,
			})

			const result = await this.eventsProcessor.process({
				id: group.id,
				type: SCHEDULE_TYPE.GROUP,
				runId,
			})

			if (result.isErr()) {
				failedGroupIds.push(group.id)
				this.logger.log(`${LOG_PREFIX}|group-schedule-processing-failed`, {
					groupId: group.id,
					originalError: result.error.cause,
				})
			}

			// Yield to the I/O phase before the inter-group delay so Fastify can
			// service pending HTTP requests even on a CPU-constrained container.
			await new Promise(setImmediate)
			await setTimeout(CIST_DELAY_MS)
		}

		// Sweep stale link rows before sweeping events. Links for failed groups are
		// protected so a transient CIST failure doesn't erase their associations.
		// Event sweep runs last; cascade would clean links anyway, but doing it
		// explicitly keeps the tables consistent between the two deletes.
		await this.eventsProcessor.removeExtraEventLinks(runId, failedGroupIds)

		// Only sweep events the crawler dropped; events of groups we couldn't refresh
		// this run are protected so a transient CIST failure doesn't delete them.
		await Promise.all([
			this.eventsProcessor.removeExtraEvents(runId, failedGroupIds),
			this.cache.set(HEALTH_CHECK_KEY, SYSTEM_HEALTH_STATUS.HEALTHY),
			this.cache.set(IS_UPDATE_IN_PROGRESS_KEY, UPDATE_STATUS.FINISHED),
		])

		if (failedGroupIds.length) {
			await this.webhookService.ping(
				`:warning: schedule sync finished with ${failedGroupIds.length}/${totalGroups} group(s) failed; their events were kept.`,
			)
		}

		this.logger.log('Job completed sucessfully')
	}

	private async logProcessingException(
		entity: ScheduleEntity,
		exception: CistCrawlerException,
	): Promise<void> {
		const plural = `${entity}s`
		const errMessage = `:warning: ${plural} processing failed!\n\`\`\`${stringifyErrorCause(exception.cause)}\`\`\``

		this.logger.log(`${LOG_PREFIX}|${plural}-processing-failed`, {
			originalError: exception.cause,
		})

		await this.webhookService.ping(errMessage)
	}
}
