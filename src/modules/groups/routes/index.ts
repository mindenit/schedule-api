import type { Routes } from '@/core/types/routes.js'
import { getGroups } from '../handlers/index.js'
import { generateResponseSchema } from '@/core/utils/schemas.js'
import { GROUP_SCHEMA } from '../schemas/index.js'

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
	],
})
