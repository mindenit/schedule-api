import z from 'zod'
import { EventTypeSchema } from './event.dto'

const SubjectHourSchema = z.object({
	subjectId: z.number().int(),
	hours: z.number().int(),
	type: EventTypeSchema,
	teacherId: z.number().int().nullable(),
})

type SubjectHour = z.infer<typeof SubjectHourSchema>

const SubjectSchema = z.object({
	id: z.number().int(),
	name: z.string().nonempty(),
	brief: z.string().nonempty(),
})

type Subject = z.infer<typeof SubjectSchema>

export { SubjectSchema, SubjectHourSchema }
export type { Subject, SubjectHour }
