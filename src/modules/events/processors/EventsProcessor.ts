import { RedisKeyBuilder } from '@/core/builders/RedisKeyBulder.js'
import type { ScheduleType } from '@/core/constants/parsers.js'
import type { DatabaseClient } from '@/core/types/deps.js'
import {
	auditoriumTable,
	eventTable,
	eventToAcademicGroupTable,
	eventToTeacherTable,
	subjectTable,
	subjectToTeacherTable,
} from '@/db/schema/index.js'
import { eq } from 'drizzle-orm'
import type { FastifyBaseLogger } from 'fastify'
import type { Redis } from 'ioredis'
import type {
	EventsInjectableDependencies,
	EventsParser,
	EventsProcessor,
} from '../types/index.js'

export class EventsProcessorImpl implements EventsProcessor {
	private readonly db: DatabaseClient
	private readonly cache: Redis
	private readonly parser: EventsParser
	private readonly logger: FastifyBaseLogger

	constructor({
		db,
		cache,
		eventsParser,
		logger,
	}: EventsInjectableDependencies) {
		this.db = db.client
		this.cache = cache
		this.parser = eventsParser
		this.logger = logger
	}

	async process(id: number, type: ScheduleType): Promise<void> {
		try {
			const data = await this.parser.parse(id, type)

			if (!data) {
				this.logger.info(
					`[Cist Postman]: No events parsed for group with id: ${id}`,
				)
				return
			}

			const { events, subjects, hours } = data

			for (const subject of subjects) {
				const key = RedisKeyBuilder.subjectKey(subject.id)

				const isExist = await this.cache.get(key)

				if (isExist) {
					this.logger.info('[Cist Postman]: Skipping subject duplicate')
					continue
				}

				await this.db.insert(subjectTable).values(subject)
				await this.cache.set(key, 'exists')
			}

			for (const event of events) {
				const key = RedisKeyBuilder.eventKey(event)

				const isExist = await this.cache.exists(key)

				if (isExist) {
					this.logger.info('[Cist Postman]: Skipping event duplicate')

					continue
				}

				const { startTime, endTime, auditorium, type, numberPair } = event

				const e = await this.db.transaction(async (tx) => {
					const [auditoriumId] = await tx
						.select({ id: auditoriumTable.id })
						.from(auditoriumTable)
						.where(eq(auditoriumTable.name, auditorium))

					const [e] = await tx
						.insert(eventTable)
						.values({
							startedAt: startTime,
							endedAt: endTime,
							auditoriumId: auditoriumId?.id as number,
							type,
							numberPair,
							subjectId: event.subject.id,
						})
						.returning()

					for (const teacher of event.teachers) {
						const isTeacherExist = await this.cache.get(
							RedisKeyBuilder.teacherKey(teacher.id),
						)

						if (!isTeacherExist) {
							this.logger.info(
								`[Cist Postman]: Skipping event's teacher duplicate`,
							)
							continue
						}

						const teacherEventKey = RedisKeyBuilder.teacherEventKey(
							teacher.id,
							e?.id as number,
						)

						const isEventExist = await this.cache.get(teacherEventKey)

						if (!isEventExist) {
							await tx.insert(eventToTeacherTable).values({
								eventId: e?.id as number,
								teacherId: teacher.id,
							})

							await this.cache.set(teacherEventKey, 'exists')
						}

						const teacherSubjectKey = RedisKeyBuilder.teacherSubjectKey(
							teacher.id,
							event.subject.id,
						)

						const isSubjectExist = await this.cache.get(teacherSubjectKey)

						if (!isSubjectExist) {
							const hour = hours.find(
								(h) =>
									h.subjectId === event.subject.id &&
									h.teacherId === teacher.id,
							)

							if (!hour) {
								continue
							}

							// @ts-expect-error will be fixed soon
							await tx.insert(subjectToTeacherTable).values({
								...hour,
							})

							await this.cache.set(teacherSubjectKey, 'exists')
						}
					}

					for (const group of event.groups) {
						const eventGroupKey = RedisKeyBuilder.groupEventKey(
							group.id,
							e?.id as number,
						)

						const isExist = await this.cache.get(eventGroupKey)

						if (isExist) {
							this.logger.info(
								`[Cist Postman]: Skipping event's group duplicate`,
							)
							continue
						}

						await tx.insert(eventToAcademicGroupTable).values({
							eventId: e?.id as number,
							groudId: group.id,
						})

						await this.cache.set(eventGroupKey, 'exists')
					}

					return e!
				})

				await Promise.all([
					this.cache.set(key, e.id),
					this.cache.sadd('new-events', key),
				])
				this.logger.info(
					`[Cist Postman]: Events processing for group with id ${id} ended`,
				)
			}
		} catch (e: unknown) {
			const message = `Events processing for group with id ${id} failed: ${e instanceof Error ? e.message : 'Unknown error'}`

			this.logger.error(`[Cist Postman]: ${message}`)

			throw new Error(message)
		}
	}

	async removeExtraEvents(): Promise<void> {
		const eventsToRemove = await this.cache.sinter('old-events', 'new-events')

		for (const eventKey of eventsToRemove) {
			const eventId = await this.cache.get(eventKey)

			await Promise.all([
				this.db.delete(eventTable).where(eq(eventTable.id, Number(eventId))),
				this.cache.del(eventKey),
			])
		}

		const newEventsExists = await this.cache.exists('new-events')

		if (newEventsExists) {
			await Promise.all([
				this.cache.del('old-events'),
				this.cache.rename('new-events', 'old-events'),
			])
		}
	}
}
