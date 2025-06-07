import type { academicGroupTable } from './schema/academic-group.js'
import type { auditoriumTable } from './schema/auditorium.js'
import type { eventTypeEnum } from './schema/event-type-enum.js'
import type { teacherTable } from './schema/teacher.js'

type Auditorium = Pick<typeof auditoriumTable.$inferSelect, 'id' | 'name'>

type Group = Pick<typeof academicGroupTable.$inferSelect, 'id' | 'name'>

type Teacher = Pick<
	typeof teacherTable.$inferSelect,
	'id' | 'shortName' | 'fullName'
>
type Subject = {
	id: number
	title: string
	brief: string
}

type Event = {
	numberPair: number
	startTime: number
	endTime: number
	type: EventType
	auditorium: string
	subject: Subject
	groups: Group[]
	teachers: Teacher[]
}

type EventType = (typeof eventTypeEnum.enumValues)[number]

export type { Auditorium, Event, EventType, Group, Teacher, Subject }
