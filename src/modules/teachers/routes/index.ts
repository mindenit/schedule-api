import type { Routes } from '@/core/types/routes.js'
import { getTeacherSchedule, getTeachers } from '../handlers/index.js'
import { generateResponseSchema } from '@/core/utils/schemas.js'
import { TEACHER_SCHEMA } from '../schemas/index.js'
import {
	GET_SCHEDULE_PARAMS_SCHEMA,
	GET_SCHEDULE_QUERY_SCHEMA,
	SCHEDULE_SCHEMA,
} from '@/modules/schedule/schemas/index.js'

export const getTeachersRoutes = (): Routes => ({
	routes: [
		{
			method: 'GET',
			url: '/teachers',
			handler: getTeachers,
			schema: {
				summary: 'Get teachers',
				description: 'Get list of teachers',
				tags: ['Teachers'],
				response: {
					200: generateResponseSchema(TEACHER_SCHEMA.array()).describe(
						'Successful response',
					),
				},
			},
		},
		{
			method: 'GET',
			url: '/teachers/:id/schedule',
			handler: getTeacherSchedule,
			schema: {
				summary: 'Get teacher schedule',
				description: 'Get schedule for teacher in particular time interval',
				tags: ['Teachers'],
				params: GET_SCHEDULE_PARAMS_SCHEMA,
				querystring: GET_SCHEDULE_QUERY_SCHEMA,
				response: {
					200: generateResponseSchema(SCHEDULE_SCHEMA.array()).describe(
						'Successful response',
					),
				},
			},
		},
	],
})
