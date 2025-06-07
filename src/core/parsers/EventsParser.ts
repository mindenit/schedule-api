import type { Event, EventType, Group, Subject, Teacher } from '@/db/types.js'
import type {
	CistScheduleRawJson,
	RawSubject,
	RawTeacher,
} from '../types/proxy.js'
import type { Maybe } from '../types/common.js'
import type { IEventsParser } from '../types/parsers.js'
import type { CommonDependencies } from '../types/index.js'
import type { ScheduleType } from '../constants/parsers.js'
import { fetchProxy } from '../utils/proxy.js'

export class EventsParser implements IEventsParser {
	private readonly endpoint: string

	constructor({ config }: CommonDependencies) {
		const { baseUrl } = config.proxy

		this.endpoint = `${baseUrl}/schedule`
	}

	async parse(id: number, type: ScheduleType): Promise<Maybe<Event[]>> {
		const raw = await fetchProxy<CistScheduleRawJson>(
			`${this.endpoint}/${id}?type=${type}`,
		)

		console.log(raw.events.length)

		if (!Object.hasOwn(raw, 'events')) {
			return null
		}

		const events: Event[] = []

		for (const e of raw.events) {
			const pair = {
				numberPair: e.number_pair ?? 0,
				startTime: e.start_time ?? 0,
				endTime: e.end_time ?? 0,
				type: EventsParser.getType(e.type),
				auditorium: e.auditory,
				teachers: [] as Teacher[],
				groups: [] as Group[],
				subject: {
					id: 0,
					title: '',
					brief: '',
				},
			} satisfies Event

			const subject = EventsParser.findSubjectById(raw.subjects, e.subject_id)

			if (!subject) {
				continue
			}

			pair.subject = subject

			if (!Object.hasOwn(e, 'groups')) {
				continue
			}

			for (const groupId of e.groups) {
				const group = EventsParser.findGroupById(raw.groups, groupId)

				if (!group) {
					continue
				}

				pair.groups.push(group)
			}

			if (!Object.hasOwn(e, 'teachers')) {
				continue
			}

			for (const teacherId of e.teachers) {
				const teacher = EventsParser.findTeacherById(raw.teachers, teacherId)

				if (!teacher) {
					continue
				}

				pair.teachers.push(teacher)
			}

			events.push(pair)
		}

		return events.toSorted((a, b) => a.startTime - b.startTime)
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
	): Maybe<Teacher> {
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
		const { hours, ...rest } = raw

		return rest
	}
}
