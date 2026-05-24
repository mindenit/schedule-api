import { Inject, Injectable } from '@nestjs/common'
import { Result } from 'better-result'
import { eq } from 'drizzle-orm'
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import Redis from 'ioredis'
import { ENTITY_EXISTANCE } from 'src/common/constants/redis'
import { CistCrawlerException } from 'src/common/exceptions/cist-crawler.exception'
import { PromiseResult } from 'src/common/types'
import { CACHE_CONNECTION_TOKEN } from 'src/components/cache/di-tokens'
import { DATABASE_CONNECTION_TOKEN } from 'src/components/database/di-tokens'
import { Event } from 'src/core/cist/dtos/event.dto'
import { RedisKeyBuilder } from 'src/core/redis-key.builder'
import {
	auditoriumTable,
	eventTable,
	eventToAcademicGroupTable,
	eventToTeacherTable,
	subjectTable,
} from 'src/db/schema'
import { CistAbstractProcessor, UploadJob } from '../../abstract.cist-processor'
import { CistEventsParser } from './events.cist-parser'

// Types
type CistEventsProcessorException = CistCrawlerException

type PairsProcessorArgs = Readonly<{
	id: number
	type: 1 | 2
}>

@Injectable()
export class CistEventsProcessor extends CistAbstractProcessor<
	Event[],
	CistEventsProcessorException,
	PairsProcessorArgs
> {
	constructor(
		@Inject(DATABASE_CONNECTION_TOKEN)
		db: PostgresJsDatabase,
		@Inject(CACHE_CONNECTION_TOKEN)
		cache: Redis,
		private readonly cistPairsParser: CistEventsParser,
	) {
		super(db, cache)
	}

	async process({
		id,
		type,
	}: PairsProcessorArgs): PromiseResult<Event[], CistEventsProcessorException> {
		const parseResult = await this.cistPairsParser.parse({ id, type })
		if (parseResult.isErr()) {
			return Result.err(parseResult.error)
		}

		const { events, subjects } = parseResult.value

		const subjectJob: UploadJob = {
			entities: subjects,
			table: subjectTable,
			computeKey: (subjectId) =>
				RedisKeyBuilder.subjectKey(subjectId as number),
		}

		await this.uploadEntities(subjectJob)

		for (const event of events) {
			await this.processEvent(event)
		}

		return Result.ok(events)
	}

	async removeExtraEvents(): Promise<void> {
		const newKey = RedisKeyBuilder.newEventsSetKey()
		const oldKey = RedisKeyBuilder.oldEventsSetKey()

		const eventsToRemove = await this.cache.sinter(oldKey, newKey)

		for (const eventKey of eventsToRemove) {
			const eventId = await this.cache.get(eventKey)
			if (!eventId) {
				continue
			}

			await Promise.all([
				this.db.delete(eventTable).where(eq(eventTable.id, Number(eventId))),
				this.cache.del(eventKey),
			])
		}

		if (await this.cache.exists(newKey)) {
			await Promise.all([
				this.cache.del(oldKey),
				this.cache.rename(newKey, oldKey),
			])
		}
	}

	private async processEvent(event: Event): Promise<void> {
		const key = RedisKeyBuilder.eventKey(event)

		if (await this.cache.exists(key)) {
			return
		}

		const eventId = await this.db.transaction(async (tx) => {
			const [auditorium] = await tx
				.select({ id: auditoriumTable.id })
				.from(auditoriumTable)
				.where(eq(auditoriumTable.name, event.auditoriumName))

			if (!auditorium) {
				return null
			}

			const [inserted] = await tx
				.insert(eventTable)
				.values({
					startedAt: event.startedAt,
					endedAt: event.endedAt,
					auditoriumId: auditorium.id,
					type: event.type,
					numberPair: event.numberPair,
					subjectId: event.subject.id,
				})
				.returning({ id: eventTable.id })

			if (!inserted) {
				return null
			}

			for (const teacher of event.teachers) {
				const teacherEventKey = RedisKeyBuilder.teacherEventKey(
					teacher.id,
					inserted.id,
				)

				if (await this.cache.exists(teacherEventKey)) continue

				await tx
					.insert(eventToTeacherTable)
					.values({ eventId: inserted.id, teacherId: teacher.id })
					.onConflictDoNothing()

				await this.cache.set(teacherEventKey, ENTITY_EXISTANCE.EXISTS)
			}

			for (const group of event.groups) {
				const groupEventKey = RedisKeyBuilder.groupEventKey(
					group.id,
					inserted.id,
				)

				if (await this.cache.exists(groupEventKey)) {
					continue
				}

				await tx
					.insert(eventToAcademicGroupTable)
					.values({ eventId: inserted.id, groudId: group.id })
					.onConflictDoNothing()

				await this.cache.set(groupEventKey, ENTITY_EXISTANCE.EXISTS)
			}

			return inserted.id
		})

		if (eventId === null) {
			return
		}

		await Promise.all([
			this.cache.set(key, String(eventId)),
			this.cache.sadd(RedisKeyBuilder.newEventsSetKey(), key),
		])
	}
}
