import type { Routes } from '@/core/types/routes.js'
import { generateSuccessResponseSchema } from '@/core/utils/schemas.js'
import { AUDITORIUM_SCHEMA } from '@/modules/auditoriums/schemas/index.js'
import { GROUP_SCHEMA, SUBJECT_SCHEMA } from '@/modules/groups/schemas/index.js'
import {
	GET_SCHEDULE_PARAMS_SCHEMA,
	SCHEDULE_SCHEMA,
} from '@/modules/schedule/schemas/index.js'
import { getScheduleQuerySchema } from '@/modules/schedule/utils/index.js'
import {
	getTeacherAuditoriums,
	getTeacherGroups,
	getTeacherSchedule,
	getTeacherSubjects,
	getTeachers,
} from '../handlers/index.js'
import {
	GET_TEACHER_SCHEDULE_FILTERS_SCHEMA,
	TEACHER_SCHEMA,
} from '../schemas/index.js'

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
					200: generateSuccessResponseSchema(TEACHER_SCHEMA.array()).describe(
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
					200: generateSuccessResponseSchema(
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
					200: generateSuccessResponseSchema(
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
					200: generateSuccessResponseSchema(SUBJECT_SCHEMA.array()).describe(
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
				querystring: getScheduleQuerySchema(
					GET_TEACHER_SCHEDULE_FILTERS_SCHEMA,
				),
				response: {
					200: generateSuccessResponseSchema(SCHEDULE_SCHEMA.array()).describe(
						'Successful response',
					),
				},
			},
		},
	],
})
