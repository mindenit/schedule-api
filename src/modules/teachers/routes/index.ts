import type { Routes } from '@/core/types/routes.js'
import { getTeachers } from '../handlers/index.js'
import { generateResponseSchema } from '@/core/utils/schemas.js'
import { TEACHER_SCHEMA } from '../schemas/index.js'

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
	],
})
