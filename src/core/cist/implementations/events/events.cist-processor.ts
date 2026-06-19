import { Inject, Injectable } from '@nestjs/common'
import { Result } from 'better-result'
import { and, eq, inArray, lt, notInArray } from 'drizzle-orm'
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { CistCrawlerException } from 'src/common/exceptions/cist-crawler.exception'
import { PromiseResult } from 'src/common/types'
import { DATABASE_CONNECTION_TOKEN } from 'src/components/database/di-tokens'
import { LoggerService } from 'src/components/logger/logger.service'
import { Event, SubjectHour } from 'src/core/cist/dtos'
import {
	auditoriumTable,
	eventTable,
	eventToAcademicGroupTable,
	eventToTeacherTable,
	subjectTable,
	subjectToTeacherTable,
} from 'src/db/schema'

import { CistAbstractProcessor, UploadJob } from '../../abstract.cist-processor'
import { CistEventsParser } from './events.cist-parser'

// Constants
const LOG_PREFIX = 'event-processor'

@Injectable()
export class CistEventsProcessor extends CistAbstractProcessor<
	Event[],
	CistEventsProcessorException,
	PairsProcessorArgs
> {
	constructor(
		@Inject(DATABASE_CONNECTION_TOKEN)
		db: PostgresJsDatabase,
		private readonly cistPairsParser: CistEventsParser,
		private readonly logger: LoggerService,
	) {
		super(db)
	}

	async process({
		id,
		type,
		runId,
	}: PairsProcessorArgs): PromiseResult<Event[], CistEventsProcessorException> {
		const parseResult = await this.cistPairsParser.parse({ id, type })
		if (parseResult.isErr()) {
			return Result.err(parseResult.error)
		}

		const { events, subjects, hours } = parseResult.value
		const subjectJob: UploadJob = {
			entities: subjects,
			table: subjectTable,
		}

		await this.uploadEntities(subjectJob)

		if (!events.length) {
			this.logger.log(`${LOG_PREFIX}|no-events-found`, {
				entityType: 'group',
				entityId: id,
			})
			return Result.ok([])
		}

		for (const event of events) {
			await this.processEvent(event, runId, hours)
			// Yield to the I/O phase after every transaction so Fastify can service
			// pending HTTP requests between events on a CPU-constrained container.
			await new Promise(setImmediate)
		}

		return Result.ok(events)
	}

	async removeExtraEvents(
		runId: number,
		failedGroupIds: number[] = [],
	): Promise<void> {
		const isStale = lt(eventTable.lastSeenAt, runId)

		if (!failedGroupIds.length) {
			await this.db.delete(eventTable).where(isStale)
			return
		}

		const eventsOfFailedGroups = this.db
			.selectDistinct({ id: eventToAcademicGroupTable.eventId })
			.from(eventToAcademicGroupTable)
			.where(inArray(eventToAcademicGroupTable.groudId, failedGroupIds))

		await this.db
			.delete(eventTable)
			.where(and(isStale, notInArray(eventTable.id, eventsOfFailedGroups)))
	}

	// Sweep stale link rows from previous runs. Must be called after all groups
	// have been processed so that no in-flight runId writes are active.
	//
	// INVARIANT: group processing must be sequential (not parallel) for the
	// within-run delete-then-reinsert in processEvent to be race-free.
	async removeExtraEventLinks(
		runId: number,
		failedGroupIds: number[] = [],
	): Promise<void> {
		const isStaleGroup = lt(eventToAcademicGroupTable.lastSeenAt, runId)
		const isStalTeacher = lt(eventToTeacherTable.lastSeenAt, runId)

		if (!failedGroupIds.length) {
			await Promise.all([
				this.db.delete(eventToAcademicGroupTable).where(isStaleGroup),
				this.db.delete(eventToTeacherTable).where(isStalTeacher),
			])
			return
		}

		const eventsOfFailedGroups = this.db
			.selectDistinct({ id: eventToAcademicGroupTable.eventId })
			.from(eventToAcademicGroupTable)
			.where(inArray(eventToAcademicGroupTable.groudId, failedGroupIds))

		await Promise.all([
			this.db
				.delete(eventToAcademicGroupTable)
				.where(
					and(
						isStaleGroup,
						notInArray(eventToAcademicGroupTable.eventId, eventsOfFailedGroups),
					),
				),
			this.db
				.delete(eventToTeacherTable)
				.where(
					and(
						isStalTeacher,
						notInArray(eventToTeacherTable.eventId, eventsOfFailedGroups),
					),
				),
		])
	}

	private async processEvent(
		event: Event,
		runId: number,
		hours: SubjectHour[],
	): Promise<void> {
		await this.db.transaction(async (tx) => {
			const [auditorium] = await tx
				.select({ id: auditoriumTable.id })
				.from(auditoriumTable)
				.where(eq(auditoriumTable.name, event.auditoriumName))

			if (!auditorium) {
				return
			}

			const [{ id: eventId }] = await tx
				.insert(eventTable)
				.values({
					startedAt: event.startedAt,
					endedAt: event.endedAt,
					numberPair: event.numberPair,
					type: event.type,
					lastSeenAt: runId,
					auditoriumId: auditorium.id,
					subjectId: event.subject.id,
				})
				.onConflictDoUpdate({
					target: [
						eventTable.startedAt,
						eventTable.endedAt,
						eventTable.subjectId,
						eventTable.type,
						eventTable.auditoriumId,
						eventTable.numberPair,
					],
					set: { lastSeenAt: runId },
				})
				.returning({ id: eventTable.id })

			if (event.teachers.length) {
				// Delete any link rows written by a previous pass within this same run
				// for the same event, then reinsert with the current run's group/teacher
				// list. This ensures the last CIST response wins within a run — preventing
				// link-table accumulation across multiple groups that share a physical
				// event row (e.g. ФВ in auditorium DL).
				await tx
					.delete(eventToTeacherTable)
					.where(
						and(
							eq(eventToTeacherTable.eventId, eventId),
							eq(eventToTeacherTable.lastSeenAt, runId),
						),
					)

				await tx
					.insert(eventToTeacherTable)
					.values(
						event.teachers.map((t) => ({
							eventId,
							teacherId: t.id,
							lastSeenAt: runId,
						})),
					)
					.onConflictDoUpdate({
						target: [
							eventToTeacherTable.eventId,
							eventToTeacherTable.teacherId,
						],
						set: { lastSeenAt: runId },
					})

				for (const teacher of event.teachers) {
					const hour = hours.find(
						(h) =>
							h.subjectId === event.subject.id &&
							h.teacherId === teacher.id &&
							h.teacherId !== null,
					)

					if (hour?.teacherId) {
						await tx
							.insert(subjectToTeacherTable)
							.values({
								subjectId: hour.subjectId,
								teacherId: hour.teacherId,
								hours: hour.hours,
								type: hour.type,
							})
							.onConflictDoNothing()
					}
				}
			}

			if (event.groups.length) {
				// Same delete-then-reinsert pattern as teachers above.
				await tx
					.delete(eventToAcademicGroupTable)
					.where(
						and(
							eq(eventToAcademicGroupTable.eventId, eventId),
							eq(eventToAcademicGroupTable.lastSeenAt, runId),
						),
					)

				await tx
					.insert(eventToAcademicGroupTable)
					.values(
						event.groups.map((g) => ({
							eventId,
							groudId: g.id,
							lastSeenAt: runId,
						})),
					)
					.onConflictDoUpdate({
						target: [
							eventToAcademicGroupTable.eventId,
							eventToAcademicGroupTable.groudId,
						],
						set: { lastSeenAt: runId },
					})
			}
		})
	}
}

// Types
type CistEventsProcessorException = CistCrawlerException

type PairsProcessorArgs = Readonly<{
	id: number
	type: 1 | 2
	runId: number
}>
