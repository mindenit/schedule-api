import type { Routes } from '@/core/types/routes.js'
import {
	getTeacherAuditoriums,
	getTeacherGroups,
	getTeacherSchedule,
	getTeacherSubjects,
	getTeachers,
} from '../handlers/index.js'
import { generateResponseSchema } from '@/core/utils/schemas.js'
import { TEACHER_SCHEMA } from '../schemas/index.js'
import {
	GET_SCHEDULE_PARAMS_SCHEMA,
	GET_SCHEDULE_QUERY_SCHEMA,
	SCHEDULE_SCHEMA,
} from '@/modules/schedule/schemas/index.js'
import { GROUP_SCHEMA, SUBJECT_SCHEMA } from '@/modules/groups/schemas/index.js'
import { AUDITORIUM_SCHEMA } from '@/modules/auditoriums/schemas/index.js'

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
			url: '/teachers/:id/auditoriums',
			handler: getTeacherAuditoriums,
			schema: {
				summary: 'Get teacher auditoriums',
				description: 'Get auditoriums for a specific teacher',
				tags: ['Teachers'],
				params: GET_SCHEDULE_PARAMS_SCHEMA,
				response: {
					200: generateResponseSchema(
						AUDITORIUM_SCHEMA.pick({ id: true, name: true }).array(),
					).describe('Successful response'),
				},
			},
		},
		{
			method: 'GET',
			url: '/teachers/:id/groups',
			handler: getTeacherGroups,
			schema: {
				summary: 'Get teacher groups',
				description: 'Get groups for a specific teacher',
				tags: ['Teachers'],
				params: GET_SCHEDULE_PARAMS_SCHEMA,
				response: {
					200: generateResponseSchema(
						GROUP_SCHEMA.pick({ id: true, name: true }).array(),
					).describe('Successful response'),
				},
			},
		},
		{
			method: 'GET',
			url: '/teachers/:id/subjects',
			handler: getTeacherSubjects,
			schema: {
				summary: 'Get teacher subjects',
				description: 'Get subjects for a specific teacher',
				tags: ['Teachers'],
				params: GET_SCHEDULE_PARAMS_SCHEMA,
				response: {
					200: generateResponseSchema(SUBJECT_SCHEMA.array()).describe(
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
