import type { DatabaseClient } from '@/core/types/deps.js'
import type { CistScheduleOutput } from '@/core/types/proxy.js'
import type { CistService } from '@/core/types/services.js'
import { hashObject } from '@/core/utils/hash.js'
import { auditoriumTable } from '@/db/schema/auditorium.js'
import { eventToAcademicGroupTable } from '@/db/schema/event-to-academic-group.js'
import { eventToTeacherTable } from '@/db/schema/event-to-teacher.js'
import { eventTable } from '@/db/schema/event.js'
import { subjectToTeacherTable } from '@/db/schema/subject-to-teacher.js'
import { subjectTable } from '@/db/schema/subject.js'
import { eq, sql } from 'drizzle-orm'
import type { Redis } from 'ioredis'
import type { EventsInjectableDependencies } from '../types/index.js'

export class EventsService implements CistService<CistScheduleOutput> {
	private readonly db: DatabaseClient
	private readonly cache: Redis

	constructor({ db, cache }: EventsInjectableDependencies) {
		this.db = db.client
		this.cache = cache
	}

	async processParsedJSON(data: CistScheduleOutput): Promise<void> {
		const { events, subjects, hours } = data

		for (const subject of subjects) {
			const key = this.getSubjectKey(subject.id)

			const isExist = await this.cache.get(key)

			if (isExist) {
				continue
			}

			await this.db.insert(subjectTable).values(subject)
			await this.cache.set(key, 'exists')
		}

		for (const event of events) {
			const eventHash = hashObject(event)

			const key = this.getEventKey(eventHash)

			const isExist = await this.cache.exists(key)

			if (isExist) {
				continue
			}

			const { startTime, endTime, auditorium, type, numberPair } = event

			await this.db.transaction(async (tx) => {
				const [auditoriumId] = await tx
					.select({ id: auditoriumTable.id })
					.from(auditoriumTable)
					.where(eq(auditoriumTable.name, auditorium))

				const [e] = await tx
					.insert(eventTable)
					.values({
						startTime: sql`to_timestamp(${startTime}) + interval '2 hours'`,
						endTime: sql`to_timestamp(${endTime}) + interval '2 hours'`,
						auditoriumId: auditoriumId?.id,
						type,
						numberPair,
					})
					.returning()

				for (const teacher of event.teachers) {
					const teacherEventKey = this.getTeacherEventKey(
						teacher.id,
						e?.id as number,
					)

					const isEventExist = await this.cache.get(teacherEventKey)

					if (isEventExist) {
						await tx.insert(eventToTeacherTable).values({
							eventId: e?.id,
							teacherId: teacher.id,
						})

						await this.cache.set(key, 'exists')
					}

					const teacherSubjectKey = this.getTeacherSubjectKey(
						teacher.id,
						event.subject.id,
					)

					const isSubjectExist = await this.cache.get(teacherSubjectKey)

					if (isSubjectExist) {
						const hour = hours.find(
							(h) =>
								h.subjectId === event.subject.id && h.teacherId === teacher.id,
						)!

						await tx.insert(subjectToTeacherTable).values({
							...hour,
						})

						await this.cache.set(teacherSubjectKey, 'exists')
					}
				}

				for (const group of event.groups) {
					const key = this.getGroupEventKey(group.id, e?.id as number)

					const isExist = await this.cache.get(key)

					if (isExist) {
						continue
					}

					await tx.insert(eventToAcademicGroupTable).values({
						eventId: e?.id,
						groudId: group.id,
					})

					await this.cache.set(key, 'exists')
				}
			})
			this.cache.set(key, 'exists')
		}
	}

	private getEventKey(hash: string): string {
		return `events:${hash}`
	}

	private getSubjectKey(subjectId: number): string {
		return `subjects:${subjectId}`
	}

	private getGroupEventKey(groupId: number, eventId: number): string {
		return `group-event:${groupId}:${eventId}`
	}

	private getTeacherEventKey(teacherId: number, eventId: number): string {
		return `teacher-event:${teacherId}:${eventId}`
	}

	private getTeacherSubjectKey(teacherId: number, subjectId: number): string {
		return `teacher-subject:${teacherId}:${subjectId}`
	}
}
