import { eventTypeEnum } from '@/db/schema/event-type-enum.js'
import { GROUP_SCHEMA } from '@/modules/groups/schemas/index.js'
import { TEACHER_SCHEMA } from '@/modules/teachers/schemas/index.js'
import { z } from 'zod'
import {
	transformEventTypesParam,
	transformIdsParam,
} from '../utils/query-string.js'

const SCHEDULE_SCHEMA = z.object({
	id: z.number().int().describe('Identifier of double period'),
	startedAt: z
		.number()
		.describe('Unix timestamp when double period is starting'),
	endedAt: z.number().describe('Unix timestamp when double period is ending'),
	type: z.enum(eventTypeEnum.enumValues).describe('Type of an event'),
	auditorium: z
		.object({
			id: z.number().describe('Auditorium identifier'),
			name: z
				.string()
				.describe('Name of an auditorium where double period is held'),
		})
		.describe('Auditorium where double period is held'),
	numberPair: z.number().int().describe('Number of pair'),
	subject: z
		.object({
			id: z.number().int().describe('Subject identifier'),
			title: z.string().describe('Title of subject'),
			brief: z.string().describe('Brief of subject'),
		})
		.describe('Subject from which there will be a double period'),
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

const GET_SCHEDULE_FILTERS_SCHEMA = z.object({
	lessonTypes: z
		.string()
		.nullable()
		.default(null)
		.transform(transformEventTypesParam),
	teachers: z.string().nullable().default(null).transform(transformIdsParam),
	auditoriums: z.string().nullable().default(null).transform(transformIdsParam),
})

type GET_SCHEDULE_FILTERS = z.infer<typeof GET_SCHEDULE_FILTERS_SCHEMA>

const GET_SCHEDULE_TIME_INTERVAL_SCHEMA = z.object({
	startedAt: z.coerce
		.number()
		.min(0)
		.refine((ts) => ts < 1e10, {
			message: 'Should be a Unix timestamp in seconds',
		})
		.nullable()
		.default(null)
		.describe('Start time of the schedule range'),
	endedAt: z.coerce
		.number()
		.min(0)
		.refine((ts) => ts < 1e10, {
			message: 'Should be a Unix timestamp in seconds',
		})
		.nullable()
		.default(null)
		.describe('End time of the schedule range'),
})

type GET_SCHEDULE_TIME_INTERVAL = z.infer<
	typeof GET_SCHEDULE_TIME_INTERVAL_SCHEMA
>

const GET_SCHEDULE_QUERY_SCHEMA = GET_SCHEDULE_TIME_INTERVAL_SCHEMA.extend({
	filters: GET_SCHEDULE_FILTERS_SCHEMA.default({
		auditoriums: null,
		lessonTypes: null,
		teachers: null,
	}),
})

type GET_SCHEDULE_QUERY = z.infer<typeof GET_SCHEDULE_QUERY_SCHEMA>

type GET_SCHEDULE_OPTIONS = GET_SCHEDULE_PARAMS & GET_SCHEDULE_QUERY

export {
	GET_SCHEDULE_FILTERS_SCHEMA,
	GET_SCHEDULE_PARAMS_SCHEMA,
	GET_SCHEDULE_QUERY_SCHEMA,
	GET_SCHEDULE_TIME_INTERVAL_SCHEMA,
	SCHEDULE_SCHEMA,
}
export type {
	GET_SCHEDULE_FILTERS,
	GET_SCHEDULE_OPTIONS,
	GET_SCHEDULE_PARAMS,
	GET_SCHEDULE_QUERY,
	GET_SCHEDULE_TIME_INTERVAL,
}
