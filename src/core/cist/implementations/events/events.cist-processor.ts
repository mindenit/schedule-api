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

		for (const event of events) {
			await this.processEvent(event, runId, hours)
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
								.onConflictDoNothing()
						}
					}
				}
			}

			if (event.groups.length) {
				await tx
					.insert(eventToAcademicGroupTable)
					.values(event.groups.map((g) => ({ eventId, groudId: g.id })))
					.onConflictDoNothing()
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
