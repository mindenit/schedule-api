import CistCrawler, {
	Event as CistEvent,
	Group as CistGroup,
	Subject as CistSubject,
	Teacher as CistTeacher,
} from '@mindenit/cist-crawler'
import { Inject, Injectable } from '@nestjs/common'
import { Result } from 'better-result'
import {
	CistCrawlerErrorCodes,
	CistCrawlerException,
} from 'src/common/exceptions/cist-crawler.exception'
import { PromiseResult } from 'src/common/types'
import { Array } from 'src/common/utils/array'
import { CIST_CRAWLER_TOKEN } from 'src/components/cist-crawler/di-tokens'

import { PairsParserOutput } from '../../cist.types'
import {
	Event,
	EventGroup,
	EventTeacher,
	Subject,
	SubjectHour,
} from '../../dtos'
import { collectEntity } from '../../helpers/collect-entity.helper'
import { CistParser } from '../../interfaces/parser.interface'
import { EventMapper, SubjectHourMapper, SubjectMapper } from '../../mappers'

// Constants
export const SCHEDULE_TYPE = {
	GROUP: 1,
	TEACHER: 2,
} as const

// Types
export type ScheduleType = (typeof SCHEDULE_TYPE)[keyof typeof SCHEDULE_TYPE]

type PairsParserArgs = Readonly<{
	id: number
	type: ScheduleType
}>

interface Accumulator {
	events: Event[]
	subjects: Subject[]
	hours: SubjectHour[]
}

@Injectable()
export class CistEventsParser implements CistParser<
	PairsParserOutput,
	CistCrawlerException,
	PairsParserArgs
> {
	private readonly eventMapper = new EventMapper()
	private readonly subjectMapper = new SubjectMapper()
	private readonly subjectHourMapper = new SubjectHourMapper()

	constructor(
		@Inject(CIST_CRAWLER_TOKEN)
		private readonly cistCrawler: CistCrawler,
	) {}

	async parse({
		id,
		type,
	}: PairsParserArgs): PromiseResult<PairsParserOutput, CistCrawlerException> {
		const responseResult = await Result.tryPromise({
			try: () => this.cistCrawler.getSchedule(type, id),
			catch: (e) =>
				new CistCrawlerException(
					CistCrawlerErrorCodes.FETCH_FAILED,
					e instanceof Error ? e.message : 'Failed to fetch schedule',
				),
		})

		if (responseResult.isErr()) {
			return Result.err(responseResult.error)
		}

		const acc: Accumulator = {
			events: [],
			subjects: [],
			hours: [],
		}

		const response = responseResult.unwrap()

		if (!Object.hasOwn(response, 'events')) {
			return Result.ok(acc)
		}

		for (const subject of Array.orEmpty(response.subjects)) {
			this.processSubject(subject, acc)
		}

		const subjectById = new Map(acc.subjects.map((s) => [s.id, s]))
		const teacherById = new Map(
			Array.orEmpty(response.teachers).map((t) => [t.id, t]),
		)
		const groupById = new Map(
			Array.orEmpty(response.groups).map((g) => [g.id, g]),
		)

		for (const event of Array.orEmpty(response.events)) {
			this.processEvent(event, subjectById, teacherById, groupById, acc)
		}

		acc.events.sort((a, b) => a.startedAt - b.startedAt)

		return Result.ok(acc)
	}

	private processSubject(subject: CistSubject, acc: Accumulator): void {
		if (!collectEntity(this.subjectMapper, subject, acc.subjects)) return

		for (const hour of Array.orEmpty(subject.hours)) {
			collectEntity(
				this.subjectHourMapper,
				{ ...hour, subjectId: subject.id },
				acc.hours,
			)
		}
	}

	private processEvent(
		event: CistEvent,
		subjectById: Map<number, Subject>,
		teacherById: Map<number, CistTeacher>,
		groupById: Map<number, CistGroup>,
		acc: Accumulator,
	): void {
		const subject = subjectById.get(event.subject_id)
		if (!subject) {
			return
		}

		const teachers: EventTeacher[] = []
		for (const teacherId of Array.orEmpty(event.teachers)) {
			const t = teacherById.get(teacherId)
			if (!t) {
				continue
			}

			teachers.push({
				id: t.id,
				fullName: t.full_name,
				shortName: t.short_name,
			})
		}

		const groups: EventGroup[] = []
		for (const groupId of Array.orEmpty(event.groups)) {
			const g = groupById.get(groupId)
			if (!g) {
				continue
			}

			groups.push({ id: g.id, name: g.name })
		}

		if (
			!collectEntity(
				this.eventMapper,
				{ event, subject, teachers, groups },
				acc.events,
			)
		) {
			return
		}
	}
}
