import type { Routes } from '@/core/types/routes.js'
import { getAuditoriumSchedule, getAuditoriums } from '../handlers/index.js'
import { generateSuccessResponseSchema } from '@/core/utils/schemas.js'
import { AUDITORIUM_SCHEMA } from '../schemas/index.js'
import {
	GET_SCHEDULE_PARAMS_SCHEMA,
	GET_SCHEDULE_QUERY_SCHEMA,
	SCHEDULE_SCHEMA,
} from '@/modules/schedule/schemas/index.js'

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
					200: generateSuccessResponseSchema(
						AUDITORIUM_SCHEMA.array(),
					).describe('Successful response'),
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
				querystring: GET_SCHEDULE_QUERY_SCHEMA,
				response: {
					200: generateSuccessResponseSchema(SCHEDULE_SCHEMA.array()).describe(
						'Successful response',
					),
				},
			},
		},
	],
})
