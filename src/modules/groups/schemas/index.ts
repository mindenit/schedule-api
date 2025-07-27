import {
	transformEventTypesParam,
	transformIdsParam,
} from '@/modules/schedule/utils/query-string.js'
import { z } from 'zod'

const GROUP_SCHEMA = z.object({
	id: z.number().int().describe('Group identifier'),
	name: z.string().describe('Name of group'),
	directionId: z
		.number()
		.int()
		.nullable()
		.describe('Identifer of direction group belongs to'),
	specialityId: z
		.number()
		.int()
		.nullable()
		.describe('Identifier of speciality group belongs to'),
})

const SUBJECT_SCHEMA = z.object({
	id: z.number().int().describe('Subject identifier'),
	brief: z.string().describe('Subject brief name'),
	name: z.string().describe('Subject name'),
})

const GET_GROUP_SCHEDULE_FILTERS_SCHEMA = z
	.object({
		lessonTypes: z
			.string()
			.nullable()
			.default(null)
			.transform(transformEventTypesParam)
			.describe(
				'Comma-separated list of lesson types to filter by. Example: "Лк,Пз"',
			),
		teachers: z
			.string()
			.nullable()
			.default(null)
			.transform(transformIdsParam)
			.describe(
				'Comma-separated list of teacher IDs to filter by. Example: "1,2,3"',
			),
		auditoriums: z
			.string()
			.nullable()
			.default(null)
			.transform(transformIdsParam)
			.describe(
				'Comma-separated list of auditorium IDs to filter by. Example: "1,2,3"',
			),
		subjects: z
			.string()
			.nullable()
			.default(null)
			.transform(transformIdsParam)
			.describe(
				'Comma-separated list of subject IDs to filter by. Example: "1,2,3"',
			),
	})
	.default({
		lessonTypes: [],
		teachers: [],
		auditoriums: [],
		subjects: [],
	})

type GET_GROUP_SCHEDULE_FILTERS = z.infer<
	typeof GET_GROUP_SCHEDULE_FILTERS_SCHEMA
>

export { GROUP_SCHEMA, SUBJECT_SCHEMA, GET_GROUP_SCHEDULE_FILTERS_SCHEMA }
export type { GET_GROUP_SCHEDULE_FILTERS }
