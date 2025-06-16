import { HEALTH_CHECK_SCHEMA } from '@/core/schemas/index.js'
import type { Routes } from '@/core/types/routes.js'
import { getAuditoriumsRoutes } from './auditoriums/routes/index.js'
import { getGroupsRoutes } from './groups/routes/index.js'
import { getTeachersRoutes } from './teachers/routes/index.js'

export const getRoutes = (): Routes => ({
	routes: [
		{
			method: 'GET',
			url: '/health',
			handler: (_, reply) => {
				const data = {
					uptime: process.uptime(),
					message: 'Healthy!',
					date: new Date(),
				}

				return reply.status(200).send(data)
			},
			schema: {
				tags: ['System Check'],
				summary: 'Get system status',
				response: {
					200: HEALTH_CHECK_SCHEMA,
				},
			},
		},
		...getAuditoriumsRoutes().routes,
		...getGroupsRoutes().routes,
		...getTeachersRoutes().routes,
	],
})
