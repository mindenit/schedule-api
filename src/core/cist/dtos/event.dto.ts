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

export { EventSchema, EventGroupSchema, EventTeacherSchema, EventTypeSchema }
export type { Event, EventGroup, EventTeacher }
