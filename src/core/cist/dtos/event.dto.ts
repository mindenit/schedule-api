import z from 'zod'
import { SubjectSchema } from './subject.dto'

const EventGroupSchema = z.object({
	id: z.number().int(),
	name: z.string().nonempty(),
})

type EventGroup = z.infer<typeof EventGroupSchema>

const EventTeacherSchema = z.object({
	id: z.number().int(),
	fullName: z.string().nonempty(),
	shortName: z.string().nonempty(),
})

type EventTeacher = z.infer<typeof EventTeacherSchema>

const EventTypeSchema = z.enum([
	'Лк',
	'Пз',
	'Лб',
	'Конс',
	'Зал',
	'Екз',
	'КП/КР',
])

const SubjectHourSchema = z.object({
	subjectId: z.number().int(),
	hours: z.number().int(),
	type: EventTypeSchema,
	teacherId: z.number().int().nullable(),
})

type SubjectHour = z.infer<typeof SubjectHourSchema>

export type EventType = z.infer<typeof EventTypeSchema>

const EventSchema = z.object({
	numberPair: z.number().int(),
	startedAt: z.number().int(),
	endedAt: z.number().int(),
	type: EventTypeSchema,
	auditoriumName: z.string().nonempty(),
	subject: SubjectSchema,
	teachers: z.array(EventTeacherSchema),
	groups: z.array(EventGroupSchema),
})

type Event = z.infer<typeof EventSchema>

export {
	EventSchema,
	EventGroupSchema,
	EventTeacherSchema,
	EventTypeSchema,
	SubjectHourSchema,
}
export type { Event, EventGroup, EventTeacher, SubjectHour }
