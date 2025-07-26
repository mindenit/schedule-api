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
		.transform(transformEventTypesParam)
		.describe('Comma-separated list of lesson types. Example: "Лк,Пз"'),
	groups: z
		.string()
		.nullable()
		.default(null)
		.transform(transformIdsParam)
		.describe('Comma-separated list of group identifiers. Example: "1,2,3"'),
	auditoriums: z
		.string()
		.nullable()
		.default(null)
		.transform(transformIdsParam)
		.describe(
			'Comma-separated list of auditorium identifiers. Example: "101,102"',
		),
	subjects: z
		.string()
		.nullable()
		.default(null)
		.transform(transformIdsParam)
		.describe('Comma-separated list of subject identifiers. Example: "1,2,3"'),
})

type GET_TEACHER_SCHEDULE_FILTERS = z.infer<
	typeof GET_TEACHER_SCHEDULE_FILTERS_SCHEMA
>

export { TEACHER_SCHEMA, GET_TEACHER_SCHEDULE_FILTERS_SCHEMA }
export type { GET_TEACHER_SCHEDULE_FILTERS }
