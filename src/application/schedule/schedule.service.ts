import { setTimeout } from 'node:timers/promises'

import { ConflictException, Inject, Injectable } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'
import { sql as drizzleSql } from 'drizzle-orm'
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import Redis from 'ioredis'
import {
	HEALTH_CHECK_KEY,
	IS_UPDATE_IN_PROGRESS_KEY,
	LAST_UPDATE_KEY,
	SYSTEM_HEALTH_STATUS,
	UPDATE_STATUS,
} from 'src/common/constants/health-status'
import {
	CistCrawlerErrorCodes,
	CistCrawlerException,
} from 'src/common/exceptions/cist-crawler.exception'
import { CACHE_CONNECTION_TOKEN } from 'src/components/cache/di-tokens'
import { ConfigService } from 'src/components/config/config.service'
import { DATABASE_CONNECTION_TOKEN } from 'src/components/database/di-tokens'
import { LoggerService } from 'src/components/logger/logger.service'
import {
	SyncRunsService,
	SyncRunTrigger,
	SyncSteps,
} from 'src/components/sync-runs/sync-runs.service'
import { WebhooksService } from 'src/components/webhooks/webhooks.service'
import { CistAuditoriumProcessor } from 'src/core/cist/implementations/auditoriums/auditoriums.cist-processor'
import {
	SCHEDULE_TYPE,
	ScheduleType,
} from 'src/core/cist/implementations/events/events.cist-parser'
import { CistEventsProcessor } from 'src/core/cist/implementations/events/events.cist-processor'
import { CistGroupsProcessor } from 'src/core/cist/implementations/groups/groups.cist-processor'
import { CistTeachersProcessor } from 'src/core/cist/implementations/teachers/teachers.cist-processor'
import { academicGroupTable, eventTable } from 'src/db/schema'

import { PhantomSkipService } from './phantom-skip.service'
import { SCHEDULE_ENTITY, ScheduleEntity } from './schedule.constants'

// Constants
const LOG_PREFIX = 'schedule-service'
const CIST_DELAY_MS = 8_000
// CIST has a recurring brief (~5-10min) outage window some nights. A group
// that fails with a FETCH_FAILED (network/server-availability) error is
// deferred and retried once more after the main loop finishes, by which
// point the outage has almost always passed. If more than this fraction of
// groups end up deferred, it's not a brief blip anymore — skip the retry
// pass rather than double the total run time chasing a real outage.
const MAX_DEFERRED_RATIO = 0.2

@Injectable()
export class ScheduleService {
	private running = false

	constructor(
		@Inject(DATABASE_CONNECTION_TOKEN)
		private readonly db: PostgresJsDatabase,
		@Inject(CACHE_CONNECTION_TOKEN)
		private readonly cache: Redis,
		private readonly auditoriumsProcessor: CistAuditoriumProcessor,
		private readonly eventsProcessor: CistEventsProcessor,
		private readonly groupsProcessor: CistGroupsProcessor,
		private readonly teachersProcessor: CistTeachersProcessor,
		private readonly syncRunsService: SyncRunsService,
		private readonly webhookService: WebhooksService,
		private readonly logger: LoggerService,
		private readonly configService: ConfigService,
		private readonly phantomSkipService: PhantomSkipService,
	) {}

	@Cron('0 */12 * * *', {
		name: 'cist-postman',
		timeZone: 'Europe/Kyiv',
	})
	async processSchedule(trigger: SyncRunTrigger = 'cron') {
		if (this.running) {
			this.logger.log(`${LOG_PREFIX}|skipped-overlapping-run`, { trigger })
			return
		}
		this.running = true

		const runId = Date.now()

		const steps: SyncSteps = {
			auditoriums: { ok: false, count: 0 },
			groups: { ok: false, count: 0 },
			teachers: { ok: false, count: 0 },
		}

		let totalGroups = 0
		const failedGroupIds: number[] = []
		let syncRunClosed = false

		try {
			await Promise.all([
				this.cache.set(HEALTH_CHECK_KEY, SYSTEM_HEALTH_STATUS.UPDATING),
				this.cache.set(IS_UPDATE_IN_PROGRESS_KEY, UPDATE_STATUS.IN_PROGRESS),
			])

			await this.syncRunsService.open(runId, trigger)

			// Evaluated up-front, before auditoriums/groups/teachers processing --
			// if checked later, a long-running earlier step could push execution
			// past the Sunday-00:00 boundary and silently skip that week's
			// full recheck.
			const isFullRecheck = this.phantomSkipService.isFullRecheckRun()

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
				steps.auditoriums = {
					ok: false,
					count: 0,
					error: auditoriumsResult.error.message,
				}
				await this.logProcessingException(
					SCHEDULE_ENTITY.AUDITORIUM,
					auditoriumsResult.error,
				)
			} else {
				steps.auditoriums = { ok: true, count: auditoriumsResult.value.length }
			}

			if (teachersResult.isErr()) {
				steps.teachers = {
					ok: false,
					count: 0,
					error: teachersResult.error.message,
				}
				await this.logProcessingException(
					SCHEDULE_ENTITY.TEACHER,
					teachersResult.error,
				)
			} else {
				steps.teachers = { ok: true, count: teachersResult.value.length }
			}

			if (groupsResult.isErr()) {
				steps.groups = {
					ok: false,
					count: 0,
					error: groupsResult.error.message,
				}
				await this.logProcessingException(
					SCHEDULE_ENTITY.GROUP,
					groupsResult.error,
				)
			} else {
				steps.groups = { ok: true, count: groupsResult.value.length }
			}

			this.logger.log('Start filling schedule')

			const existingGroups = await this.db.select().from(academicGroupTable)
			const allGroups = groupsResult.unwrapOr(existingGroups)

			const { enabled: phantomSkipEnabled } =
				this.configService.get('phantomSkip')
			const skipSet =
				phantomSkipEnabled && !isFullRecheck
					? await this.phantomSkipService.getSkipSet()
					: new Set<number>()

			const groups = skipSet.size
				? allGroups.filter((g) => !skipSet.has(g.id))
				: allGroups

			if (skipSet.size) {
				const skippedCount = allGroups.length - groups.length
				steps.phantomSkip = { count: skippedCount }
				this.logger.log(`${LOG_PREFIX}|phantom-skip-applied`, {
					skipped: skippedCount,
					totalKnownGroups: allGroups.length,
				})
			}

			totalGroups = groups.length
			await this.syncRunsService.setTotalGroups(runId, totalGroups)

			const deferredGroups: {
				group: (typeof groups)[number]
				error: CistCrawlerException
			}[] = []

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
					if (result.error.code === CistCrawlerErrorCodes.FETCH_FAILED) {
						// Likely transient (CIST server unavailable, not a data problem
						// with this specific group) — retry later in this same run
						// instead of recording it as failed right away.
						deferredGroups.push({ group, error: result.error })
						this.logger.log(`${LOG_PREFIX}|group-schedule-deferred`, {
							groupId: group.id,
							error: result.error.message,
						})
					} else {
						failedGroupIds.push(group.id)
						this.logger.log(`${LOG_PREFIX}|group-schedule-processing-failed`, {
							groupId: group.id,
							error: result.error.message,
						})
						await this.syncRunsService.recordGroup(runId, group.id, {
							status: 'failed',
							eventsCount: 0,
							error: result.error.message,
						})
					}
				} else {
					await this.syncRunsService.recordGroup(runId, group.id, {
						status: 'success',
						eventsCount: result.value.length,
					})
				}

				// Yield to the I/O phase before the inter-group delay so Fastify can
				// service pending HTTP requests even on a CPU-constrained container.
				await new Promise(setImmediate)
				await setTimeout(CIST_DELAY_MS)
			}

			if (deferredGroups.length) {
				const withinRetryBudget =
					deferredGroups.length <= totalGroups * MAX_DEFERRED_RATIO

				if (withinRetryBudget) {
					this.logger.log(`${LOG_PREFIX}|retrying-deferred-groups`, {
						count: deferredGroups.length,
						totalGroups,
					})

					for (const { group } of deferredGroups) {
						const retryResult = await this.eventsProcessor.process({
							id: group.id,
							type: SCHEDULE_TYPE.GROUP,
							runId,
						})

						if (retryResult.isErr()) {
							failedGroupIds.push(group.id)
							this.logger.log(`${LOG_PREFIX}|group-schedule-retry-failed`, {
								groupId: group.id,
								error: retryResult.error.message,
							})
							await this.syncRunsService.recordGroup(runId, group.id, {
								status: 'failed',
								eventsCount: 0,
								error: retryResult.error.message,
							})
						} else {
							this.logger.log(`${LOG_PREFIX}|group-schedule-retry-succeeded`, {
								groupId: group.id,
							})
							await this.syncRunsService.recordGroup(runId, group.id, {
								status: 'success',
								eventsCount: retryResult.value.length,
							})
						}

						await new Promise(setImmediate)
						await setTimeout(CIST_DELAY_MS)
					}
				} else {
					// Too many deferred groups to be a brief blip — record them as
					// failed with their original error instead of doubling run time
					// chasing what's likely a sustained outage.
					this.logger.log(`${LOG_PREFIX}|skipping-deferred-retry`, {
						count: deferredGroups.length,
						totalGroups,
					})

					for (const { group, error } of deferredGroups) {
						failedGroupIds.push(group.id)
						await this.syncRunsService.recordGroup(runId, group.id, {
							status: 'failed',
							eventsCount: 0,
							error: error.message,
						})
					}
				}
			}

			// Phantom-skipped groups weren't fetched this run, so their events'
			// lastSeenAt wasn't refreshed either -- without protecting them here
			// the same way failed groups are, removeExtraEvents would delete
			// their real events on the very first phantom-skip run.
			const removedCount = await this.eventsProcessor.removeExtraEvents(runId, [
				...failedGroupIds,
				...skipSet,
			])

			const [{ totalEvents }] = await this.db
				.select({ totalEvents: drizzleSql<number>`count(*)::int` })
				.from(eventTable)

			const finalStatus =
				failedGroupIds.length === 0
					? 'success'
					: failedGroupIds.length === totalGroups
						? 'failed'
						: 'partial'

			// Use allSettled so one failure doesn't hide the others, then rethrow.
			const TAIL_NAMES = [
				'cache:health',
				'cache:in-progress',
				'cache:last-update',
				'db:close',
				'db:purge',
			] as const

			const tailPromises: Promise<unknown>[] = [
				this.cache.set(HEALTH_CHECK_KEY, SYSTEM_HEALTH_STATUS.HEALTHY),
				this.cache.set(IS_UPDATE_IN_PROGRESS_KEY, UPDATE_STATUS.FINISHED),
				this.cache.set(LAST_UPDATE_KEY, new Date().toISOString()),
				this.syncRunsService.close(runId, {
					status: finalStatus,
					totalGroups,
					failedGroups: failedGroupIds.length,
					removedEvents: removedCount,
					totalEvents,
					steps,
				}),
				this.syncRunsService.purgeOldRuns(),
			]

			const settled = await Promise.allSettled(tailPromises)
			const failures = settled
				.map((r, i): { step: string; reason: unknown } | null =>
					r.status === 'rejected'
						? { step: TAIL_NAMES[i] ?? `step-${i}`, reason: r.reason } // eslint-disable-line security/detect-object-injection
						: null,
				)
				.filter((x): x is { step: string; reason: unknown } => x !== null)

			if (failures.length) {
				this.logger.error(`${LOG_PREFIX}|tail-step-failures`, { failures })
				// mark run as closed so catch block won't clobber the db:close result
				if (settled[3].status === 'fulfilled') syncRunClosed = true
				throw failures[0].reason
			}

			syncRunClosed = true

			if (failedGroupIds.length) {
				await this.webhookService.ping(
					`:warning: schedule sync finished with ${failedGroupIds.length}/${totalGroups} group(s) failed; their events were kept.`,
				)
			}

			this.logger.log('Job completed successfully')
		} catch (err: unknown) {
			this.logger.error(`${LOG_PREFIX}|unexpected-failure`, { err })
			// Only write failed status if close() hasn't already recorded a result.
			// This prevents the catch from clobbering a valid partial/success row.
			if (!syncRunClosed) {
				await Promise.allSettled([
					this.cache.set(HEALTH_CHECK_KEY, SYSTEM_HEALTH_STATUS.FAILED),
					this.cache.set(IS_UPDATE_IN_PROGRESS_KEY, UPDATE_STATUS.FINISHED),
					this.syncRunsService.close(runId, {
						status: 'failed',
						totalGroups,
						failedGroups: failedGroupIds.length,
						removedEvents: 0,
						totalEvents: 0,
						steps,
					}),
				])
			} else {
				// close() succeeded but another tail step failed; still mark cache
				await Promise.allSettled([
					this.cache.set(HEALTH_CHECK_KEY, SYSTEM_HEALTH_STATUS.FAILED),
					this.cache.set(IS_UPDATE_IN_PROGRESS_KEY, UPDATE_STATUS.FINISHED),
				])
			}
			throw err
		} finally {
			this.running = false
		}
	}

	/*
	 * On-demand refetch of a single group or teacher's schedule, outside the
	 * normal cron cycle. Reuses sync_run (trigger='manual') for audit trail
	 * visibility in the dashboard, but doesn't touch sync_run_group -- that
	 * table's FK is bound to academic_group, so it can't represent a
	 * teacher refetch. Both entity types are recorded uniformly in
	 * steps.manualRefetch instead.
	 *
	 * Shares the `running` guard with processSchedule(): open() reconciles
	 * any 'running' sync_run row as a crash-recovery measure, which would
	 * otherwise incorrectly flip a genuinely in-flight cron run to 'failed'
	 * if triggered concurrently. Also guards against two manual refetches
	 * racing each other.
	 */
	async refetchEntity(
		type: ScheduleType,
		id: number,
	): Promise<{ ok: boolean; eventsCount: number; error?: string }> {
		if (this.running) {
			throw new ConflictException(
				'A sync is already in progress; try again once it finishes',
			)
		}
		this.running = true

		const runId = Date.now()
		const entityType = type === SCHEDULE_TYPE.GROUP ? 'group' : 'teacher'
		let syncRunClosed = false

		try {
			await this.syncRunsService.open(runId, 'manual')

			const result = await this.eventsProcessor.process({ id, type, runId })
			const ok = !result.isErr()
			const eventsCount = result.isErr() ? 0 : result.value.length
			const error = result.isErr() ? result.error.message : undefined

			this.logger.log(`${LOG_PREFIX}|manual-refetch`, {
				entityType,
				entityId: id,
				ok,
				eventsCount,
				error,
			})

			await this.syncRunsService.close(runId, {
				status: ok ? 'success' : 'failed',
				totalGroups: 1,
				failedGroups: ok ? 0 : 1,
				removedEvents: 0,
				totalEvents: eventsCount,
				steps: {
					manualRefetch: { entityType, entityId: id, ok, eventsCount, error },
				},
			})
			syncRunClosed = true

			return { ok, eventsCount, error }
		} catch (err: unknown) {
			this.logger.error(`${LOG_PREFIX}|manual-refetch-unexpected-failure`, {
				entityType,
				entityId: id,
				err,
			})

			if (!syncRunClosed) {
				const error = err instanceof Error ? err.message : 'Unexpected error'
				await this.syncRunsService.close(runId, {
					status: 'failed',
					totalGroups: 1,
					failedGroups: 1,
					removedEvents: 0,
					totalEvents: 0,
					steps: {
						manualRefetch: {
							entityType,
							entityId: id,
							ok: false,
							eventsCount: 0,
							error,
						},
					},
				})
			}

			throw err
		} finally {
			this.running = false
		}
	}

	private async logProcessingException(
		entity: ScheduleEntity,
		exception: CistCrawlerException,
	): Promise<void> {
		const plural = `${entity}s`
		const errMessage = `:warning: ${plural} processing failed!\n\`\`\`${exception.message}\`\`\``

		this.logger.log(`${LOG_PREFIX}|${plural}-processing-failed`, {
			error: exception.message,
		})

		await this.webhookService.ping(errMessage)
	}
}
