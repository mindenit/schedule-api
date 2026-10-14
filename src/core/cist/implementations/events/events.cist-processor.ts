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
	academicGroupTable,
	auditoriumTable,
	eventTable,
	eventToAcademicGroupTable,
	eventToTeacherTable,
	subjectTable,
	subjectToTeacherTable,
	teacherTable,
} from 'src/db/schema'

import { CistAbstractProcessor, UploadJob } from '../../abstract.cist-processor'
import { CistEventsParser } from './events.cist-parser'

// Constants
const LOG_PREFIX = 'event-processor'

// Utils
const buildTeachersKey = (teachers: Event['teachers']): string => {
	return teachers
		.map((t) => t.id)
		.toSorted((a, b) => a - b)
		.join(',')
}

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

		const groupId = type === 1 ? id : null
		const seenEventIds = new Set<number>()

		for (const event of events) {
			const eventId = await this.processEvent(event, runId, hours, groupId)
			if (eventId !== null) seenEventIds.add(eventId)
			await new Promise(setImmediate)
		}

		// Events skipped for unknown auditorium are unseen, so their links go too
		if (groupId !== null && seenEventIds.size) {
			const pruned = await this.db
				.delete(eventToAcademicGroupTable)
				.where(
					and(
						eq(eventToAcademicGroupTable.groudId, groupId),
						notInArray(eventToAcademicGroupTable.eventId, [...seenEventIds]),
					),
				)
				.returning({ eventId: eventToAcademicGroupTable.eventId })

			if (pruned.length) {
				this.logger.log(`${LOG_PREFIX}|stale-group-links-pruned`, {
					groupId,
					count: pruned.length,
				})
			}
		}

		return Result.ok(events)
	}

	// For groups whose feed stayed empty for a long streak: an empty feed prunes
	// nothing in process(), so their old links would otherwise live forever.
	async removeLinksOfGroups(groupIds: number[]): Promise<number> {
		if (!groupIds.length) return 0

		const deleted = await this.db
			.delete(eventToAcademicGroupTable)
			.where(inArray(eventToAcademicGroupTable.groudId, groupIds))
			.returning({ eventId: eventToAcademicGroupTable.eventId })
		return deleted.length
	}

	async removeExtraEvents(
		runId: number,
		failedGroupIds: number[] = [],
	): Promise<number> {
		const isStale = lt(eventTable.lastSeenAt, runId)

		if (!failedGroupIds.length) {
			const deleted = await this.db
				.delete(eventTable)
				.where(isStale)
				.returning({ id: eventTable.id })
			return deleted.length
		}

		const eventsOfFailedGroups = this.db
			.selectDistinct({ id: eventToAcademicGroupTable.eventId })
			.from(eventToAcademicGroupTable)
			.where(inArray(eventToAcademicGroupTable.groudId, failedGroupIds))

		const deleted = await this.db
			.delete(eventTable)
			.where(and(isStale, notInArray(eventTable.id, eventsOfFailedGroups)))
			.returning({ id: eventTable.id })
		return deleted.length
	}

	private async processEvent(
		event: Event,
		runId: number,
		hours: SubjectHour[],
		groupId: number | null,
	): Promise<number | null> {
		return this.db.transaction(async (tx) => {
			const [auditorium] = await tx
				.select({ id: auditoriumTable.id })
				.from(auditoriumTable)
				.where(eq(auditoriumTable.name, event.auditoriumName))

			if (!auditorium) {
				return null
			}

			const [{ id: eventId }] = await tx
				.insert(eventTable)
				.values({
					startedAt: event.startedAt,
					endedAt: event.endedAt,
					numberPair: event.numberPair,
					type: event.type,
					lastSeenAt: runId,
					teachersKey: buildTeachersKey(event.teachers),
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
						eventTable.teachersKey,
					],
					set: { lastSeenAt: runId },
				})
				.returning({ id: eventTable.id })

			if (event.teachers.length) {
				const existingTeachers = await tx
					.select({ id: teacherTable.id })
					.from(teacherTable)
					.where(
						inArray(
							teacherTable.id,
							event.teachers.map((t) => t.id),
						),
					)

				const existingTeacherIds = new Set(existingTeachers.map((t) => t.id))
				const knownTeachers = event.teachers.filter((t) =>
					existingTeacherIds.has(t.id),
				)

				if (knownTeachers.length) {
					await tx
						.insert(eventToTeacherTable)
						.values(knownTeachers.map((t) => ({ eventId, teacherId: t.id })))
						.onConflictDoNothing()

					for (const teacher of knownTeachers) {
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
								.onConflictDoUpdate({
									target: [
										subjectToTeacherTable.subjectId,
										subjectToTeacherTable.teacherId,
										subjectToTeacherTable.type,
									],
									set: { hours: hour.hours },
								})
						}
					}
				}
			}

			// A group's own fetch is the only source of its links
			const groups = groupId === null ? event.groups : [{ id: groupId }]

			if (groups.length) {
				const existingGroups = await tx
					.select({ id: academicGroupTable.id })
					.from(academicGroupTable)
					.where(
						inArray(
							academicGroupTable.id,
							groups.map((g) => g.id),
						),
					)

				const existingGroupIds = new Set(existingGroups.map((g) => g.id))
				const knownGroups = groups.filter((g) => existingGroupIds.has(g.id))

				if (knownGroups.length) {
					await tx
						.insert(eventToAcademicGroupTable)
						.values(knownGroups.map((g) => ({ eventId, groudId: g.id })))
						.onConflictDoNothing()
				}
			}

			return eventId
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
