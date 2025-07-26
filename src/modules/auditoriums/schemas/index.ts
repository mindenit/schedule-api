import {
	transformEventTypesParam,
	transformIdsParam,
} from '@/modules/schedule/utils/query-string.js'
import { z } from 'zod'

const AUDITORIUM_SCHEMA = z.object({
	id: z.number().int().describe('Auditorium identifier'),
	name: z.string().max(255).describe('Name of auditorium'),
	floor: z.number().int().describe('Floor where auditorium is located'),
	hasPower: z.boolean(),
	buildingId: z
		.string()
		.describe('Identifier of building where auditorium is located'),
})

const GET_AUDITORIUM_SCHEDULE_FILTERS_SCHEMA = z.object({
	lessonTypes: z
		.string()
		.nullable()
		.default(null)
		.transform(transformEventTypesParam),
	teachers: z.string().nullable().default(null).transform(transformIdsParam),
	groups: z.string().nullable().default(null).transform(transformIdsParam),
	subjects: z.string().nullable().default(null).transform(transformIdsParam),
})

type GET_AUDITORIUM_SCHEDULE_FILTERS = z.infer<
	typeof GET_AUDITORIUM_SCHEDULE_FILTERS_SCHEMA
>

export { AUDITORIUM_SCHEMA, GET_AUDITORIUM_SCHEDULE_FILTERS_SCHEMA }
export type { GET_AUDITORIUM_SCHEDULE_FILTERS }
