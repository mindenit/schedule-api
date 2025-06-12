import type { ScheduleType } from '@/core/constants/parsers.js'
import type { CommonDependencies, Maybe } from '@/core/types/index.js'
import type {
	CistScheduleOutput,
	CistScheduleRawJson,
	RawSubject,
	RawTeacher,
	SubjectHour,
} from '@/core/types/proxy.js'
import { fetchProxy } from '@/core/utils/index.js'
import type {
	Event,
	EventType,
	Group,
	GroupData,
	Subject,
	TeacherData,
} from '@/db/types.js'
import type { EventsParser } from '../types/index.js'

export class EventsParserImpl implements EventsParser {
	private readonly endpoint: string

	constructor({ config }: CommonDependencies) {
		const { baseUrl } = config.proxy

		this.endpoint = `${baseUrl}/schedule`
	}

	async parse(
		id: number,
		type: ScheduleType,
	): Promise<Maybe<CistScheduleOutput>> {
		console.log(`${this.endpoint}/${id}?type=${type}`)

		const raw = await fetchProxy<CistScheduleRawJson>(
			`${this.endpoint}/${id}?type=${type}`,
		)

		if (Array.isArray(raw) && !raw.length) {
			return null
		}

		if (!Object.hasOwn(raw, 'events')) {
			return null
		}

		const events: Omit<Event, 'id'>[] = []
		const subjects: Subject[] = []
		const hours = EventsParserImpl.getSubjectHours(raw.subjects)

		for (const e of raw.events) {
			const pair = {
				numberPair: e.number_pair ?? 0,
				startTime: e.start_time ?? 0,
				endTime: e.end_time ?? 0,
				type: EventsParserImpl.getType(e.type),
				auditorium: e.auditory,
				teachers: [] as TeacherData[],
				groups: [] as GroupData[],
				subject: {
					id: 0,
					name: '',
					brief: '',
				},
			} satisfies Omit<Event, 'id'>

			const subject = EventsParserImpl.findSubjectById(
				raw.subjects,
				e.subject_id,
			)

			if (!subject) {
				continue
			}

			pair.subject = subject
			subjects.push(subject)

			if (!Object.hasOwn(e, 'groups')) {
				continue
			}

			for (const groupId of e.groups) {
				const group = EventsParserImpl.findGroupById(raw.groups, groupId)

				if (!group) {
					continue
				}

				pair.groups.push(group)
			}

			if (!Object.hasOwn(e, 'teachers')) {
				continue
			}

			for (const teacherId of e.teachers) {
				const teacher = EventsParserImpl.findTeacherById(
					raw.teachers,
					teacherId,
				)

				if (!teacher) {
					continue
				}

				pair.teachers.push(teacher)
			}

			events.push(pair)
		}

		return {
			events: events.toSorted((a, b) => a.startTime - b.startTime),
			subjects,
			hours,
		}
	}

	private static getType(id: number): EventType {
		if (id === 10 || id === 12) {
			return 'Пз'
		}

		if (id >= 20 && id <= 24) {
			return 'Лб'
		}

		if (id === 30) {
			return 'Конс'
		}

		if (id >= 40 && id <= 41) {
			return 'Зал'
		}

		if (id >= 50 && id <= 55) {
			return 'Екз'
		}

		if (id === 60) {
			return 'КП/КР'
		}

		return 'Лк'
	}

	private static findTeacherById(
		teachers: RawTeacher[],
		id: number,
	): Maybe<TeacherData> {
		const raw = teachers.find((t) => t.id === id)

		if (!raw) {
			return null
		}

		return {
			id: raw.id,
			fullName: raw.full_name,
			shortName: raw.short_name,
		}
	}

	private static findGroupById(groups: Group[], id: number): Maybe<Group> {
		const group = groups.find((g) => g.id === id)

		return group ?? null
	}

	private static findSubjectById(
		subjects: RawSubject[],
		id: number,
	): Maybe<Subject> {
		const raw = subjects.find((s) => s.id === id)

		if (!raw) {
			return null
		}

		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { hours, title, ...rest } = raw

		return {
			...rest,
			name: title,
		}
	}

	private static getSubjectHours(subjects: RawSubject[]): SubjectHour[] {
		const hours: SubjectHour[] = []

		for (const subject of subjects) {
			const mappedHours = subject.hours.map((h): SubjectHour => {
				return {
					hours: h.val,
					type: EventsParserImpl.getType(h.type),
					teacherId: h.teachers[0] ?? null,
					subjectId: subject.id,
				}
			})

			hours.push(...mappedHours)
		}

		return hours
	}
}
