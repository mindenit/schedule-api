import type { Routes } from '@/core/types/routes.js'
import { generateResponseSchema } from '@/core/utils/schemas.js'
import { GROUP_SCHEMA, SUBJECT_SCHEMA } from '@/modules/groups/schemas/index.js'
import {
	GET_SCHEDULE_PARAMS_SCHEMA,
	SCHEDULE_SCHEMA,
} from '@/modules/schedule/schemas/index.js'
import { getScheduleQuerySchema } from '@/modules/schedule/utils/index.js'
import { TEACHER_SCHEMA } from '@/modules/teachers/schemas/index.js'
import {
	getAuditoriumGroups,
	getAuditoriumSchedule,
	getAuditoriumSubjects,
	getAuditoriumTeachers,
	getAuditoriums,
} from '../handlers/index.js'
import {
	AUDITORIUM_SCHEMA,
	GET_AUDITORIUM_SCHEDULE_FILTERS_SCHEMA,
} from '../schemas/index.js'

export const getAuditoriumsRoutes = (): Routes => ({
	routes: [
		{
			method: 'GET',
			url: '/auditoriums',
			handler: getAuditoriums,
			schema: {
				summary: 'Get auditoriums',
				description: 'Get list of auditoriums',
				tags: ['Auditoriums'],
				response: {
					200: generateResponseSchema(AUDITORIUM_SCHEMA.array()).describe(
						'Successful response',
					),
				},
			},
		},
		{
			method: 'GET',
			url: '/auditoriums/:id/groups',
			handler: getAuditoriumGroups,
			schema: {
				summary: 'Get auditorium groups',
				description: 'Get groups for a specific auditorium',
				tags: ['Auditoriums'],
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
			url: '/auditoriums/:id/teachers',
			handler: getAuditoriumTeachers,
			schema: {
				summary: 'Get auditorium teachers',
				description: 'Get teachers for a specific auditorium',
				tags: ['Auditoriums'],
				params: GET_SCHEDULE_PARAMS_SCHEMA,
				response: {
					200: generateResponseSchema(
						TEACHER_SCHEMA.omit({ departmentId: true }).array(),
					).describe('Successful response'),
				},
			},
		},
		{
			method: 'GET',
			url: '/auditoriums/:id/subjects',
			handler: getAuditoriumSubjects,
			schema: {
				summary: 'Get auditorium subjects',
				description: 'Get subjects for a specific auditorium',
				tags: ['Auditoriums'],
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
			url: '/auditoriums/:id/schedule',
			handler: getAuditoriumSchedule,
			schema: {
				summary: 'Get auditorium schedule',
				description:
					'Get schedule for an auditorium in particular time interval',
				tags: ['Auditoriums'],
				params: GET_SCHEDULE_PARAMS_SCHEMA,
				querystring: getScheduleQuerySchema(
					GET_AUDITORIUM_SCHEDULE_FILTERS_SCHEMA,
				),
				response: {
					200: generateResponseSchema(SCHEDULE_SCHEMA.array()).describe(
						'Successful response',
					),
				},
			},
		},
	],
})
