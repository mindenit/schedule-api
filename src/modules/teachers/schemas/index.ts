import {
	transformEventTypesParam,
	transformIdsParam,
} from '@/modules/schedule/utils/query-string.js'
import { z } from 'zod'

const TEACHER_SCHEMA = z.object({
	id: z.number().int().describe('Teacher identifier'),
	fullName: z
		.string()
		.describe('Last name, first name, and patronymic of teacher'),
	shortName: z.string().describe('Last name and initials of teacher'),
	departmentId: z
		.number()
		.int()
		.describe('Identifier of department teacher belongs to'),
})

const GET_TEACHER_SCHEDULE_FILTERS_SCHEMA = z.object({
	lessonTypes: z
		.string()
		.nullable()
		.default(null)
		.transform(transformEventTypesParam),
	groups: z.string().nullable().default(null).transform(transformIdsParam),
	auditoriums: z.string().nullable().default(null).transform(transformIdsParam),
	subjects: z.string().nullable().default(null).transform(transformIdsParam),
})

type GET_TEACHER_SCHEDULE_FILTERS = z.infer<
	typeof GET_TEACHER_SCHEDULE_FILTERS_SCHEMA
>

export { TEACHER_SCHEMA, GET_TEACHER_SCHEDULE_FILTERS_SCHEMA }
export type { GET_TEACHER_SCHEDULE_FILTERS }
