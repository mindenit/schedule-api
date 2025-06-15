import { eventTypeEnum } from '@/db/schema/event-type-enum.js'
import { GROUP_SCHEMA } from '@/modules/groups/schemas/index.js'
import { TEACHER_SCHEMA } from '@/modules/teachers/schemas/index.js'
import { z } from 'zod'

const SCHEDULE_SCHEMA = z.object({
	id: z.number().int().describe('Identifier of double period'),
	startedAt: z
		.string()
		.datetime()
		.describe('Timestamp when double period is starting'),
	endedAt: z
		.string()
		.datetime()
		.describe('Timestamp when double period is ending'),
	type: z.enum(eventTypeEnum.enumValues).describe('Type of an event'),
	auditorium: z
		.string()
		.describe('Name of an auditorium where double period is hold'),
	numberPair: z.number().int().describe('Number of pair'),
	subject: z.object({
		id: z.number().int().describe('Subject identifier'),
		title: z.string().describe('Title of subject'),
		brief: z.string().describe('Brief of subject'),
	}),
	groups: GROUP_SCHEMA.omit({ directionId: true, specialityId: true })
		.array()
		.describe('List of groups which attend the class'),
	teachers: TEACHER_SCHEMA.omit({ departmentId: true })
		.array()
		.describe('List of teachers who teach the class'),
})

const GET_SCHEDULE_PARAMS_SCHEMA = z.object({
	id: z.coerce.number().int().describe('Identifier of an entity'),
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

export {
	GET_SCHEDULE_PARAMS_SCHEMA,
	GET_SCHEDULE_QUERY_SCHEMA,
	SCHEDULE_SCHEMA,
}
export type { GET_SCHEDULE_PARAMS, GET_SCHEDULE_QUERY, GET_SCHEDULE_OPTIONS }
