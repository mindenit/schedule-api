import type { Routes } from '@/core/types/routes.js'
import { getGroupSchedule, getGroups } from '../handlers/index.js'
import { generateResponseSchema } from '@/core/utils/schemas.js'
import { GROUP_SCHEMA } from '../schemas/index.js'
import {
	GET_SCHEDULE_PARAMS_SCHEMA,
	GET_SCHEDULE_QUERY_SCHEMA,
} from '@/modules/schedule/schemas/index.js'

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
					200: generateResponseSchema(GROUP_SCHEMA.array()).describe(
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
			},
		},
	],
})
