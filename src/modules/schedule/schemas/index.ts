import { z } from 'zod'

const GET_SCHEDULE_PARAMS_SCHEMA = z.object({
	id: z.coerce.number().int().min(1).describe('Identifier of an entity'),
})

type GET_SCHEDULE_PARAMS = z.infer<typeof GET_SCHEDULE_PARAMS_SCHEMA>

const GET_SCHEDULE_QUERY_SCHEMA = z.object({
	startedAt: z.coerce
		.date()
		.nullable()
		.default(null)
		.describe('Start time of the schedule range'),
	endedAt: z.coerce
		.date()
		.nullable()
		.default(null)
		.describe('End time of the schedule range'),
})

type GET_SCHEDULE_QUERY = z.infer<typeof GET_SCHEDULE_QUERY_SCHEMA>

type GET_SCHEDULE_OPTIONS = GET_SCHEDULE_PARAMS & GET_SCHEDULE_QUERY

export { GET_SCHEDULE_PARAMS_SCHEMA, GET_SCHEDULE_QUERY_SCHEMA }
export type { GET_SCHEDULE_PARAMS, GET_SCHEDULE_QUERY, GET_SCHEDULE_OPTIONS }
