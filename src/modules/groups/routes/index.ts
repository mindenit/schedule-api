import { GET_ENTITY_BY_ID_SCHEMA } from '@/core/schemas/index.js'
import type { Routes } from '@/core/types/routes.js'
import { generateSuccessResponseSchema } from '@/core/utils/schemas.js'
import {
	GET_SCHEDULE_PARAMS_SCHEMA,
	GET_SCHEDULE_QUERY_SCHEMA,
	SCHEDULE_SCHEMA,
} from '@/modules/schedule/schemas/index.js'
import { TEACHER_SCHEMA } from '@/modules/teachers/schemas/index.js'
import {
	getGroupSchedule,
	getGroupSubjects,
	getGroupTeachers,
	getGroups,
} from '../handlers/index.js'
import { GROUP_SCHEMA, SUBJECT_SCHEMA } from '../schemas/index.js'

export const getGroupsRoutes = (): Routes => ({
	routes: [
		{
			method: 'GET',
			url: '/groups',
			handler: getGroups,
			schema: {
				summary: 'Get groups',
				description: 'Get list of groups',
				tags: ['Groups'],
				response: {
					200: generateSuccessResponseSchema(GROUP_SCHEMA.array()).describe(
						'Successful response',
					),
				},
			},
		},
		{
			method: 'GET',
			url: '/groups/:id/schedule',
			handler: getGroupSchedule,
			schema: {
				summary: 'Get group schedule',
				description: 'Get schedule for a group in particular time interval',
				tags: ['Groups'],
				params: GET_SCHEDULE_PARAMS_SCHEMA,
				querystring: GET_SCHEDULE_QUERY_SCHEMA,
				response: {
					200: generateSuccessResponseSchema(SCHEDULE_SCHEMA.array()).describe(
						'Successful response',
					),
				},
			},
		},
		{
			method: 'GET',
			url: '/groups/:id/subjects',
			handler: getGroupSubjects,
			schema: {
				summary: 'Get group subjects',
				description:
					'Get list of subjects for an appropriate group that are thought this academic year',
				tags: ['Groups'],
				params: GET_ENTITY_BY_ID_SCHEMA,
				response: {
					200: generateSuccessResponseSchema(SUBJECT_SCHEMA.array()).describe(
						'Successful response',
					),
				},
			},
		},
		{
			method: 'GET',
			url: '/groups/:id/teachers',
			handler: getGroupTeachers,
			schema: {
				summary: 'Get group teachers',
				description: `Get list of teachers for an appropeiate group that teach during this academic year`,
				tags: ['Groups'],
				params: GET_ENTITY_BY_ID_SCHEMA,
				response: {
					200: generateSuccessResponseSchema(
						TEACHER_SCHEMA.omit({ departmentId: true }).array(),
					).describe('Successful response'),
				},
			},
		},
	],
})
