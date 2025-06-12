import type { Routes } from '@/core/types/routes.js'
import { getAuditoriums } from '../handlers/index.js'
import { generateResponseSchema } from '@/core/utils/schemas.js'
import { AUDITORIUM_SCHEMA } from '../schemas/index.js'

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
	],
})
