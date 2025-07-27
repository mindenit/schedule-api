import { HEALTH_CHECK_SCHEMA } from '@/core/schemas/index.js'
import type { Routes } from '@/core/types/routes.js'
import { getAuditoriumsRoutes } from './auditoriums/routes/index.js'
import { getGroupsRoutes } from './groups/routes/index.js'
import { getTeachersRoutes } from './teachers/routes/index.js'
import { getLinksRoutes } from './links/routes/index.js'
import { HEALTH_CHECK_KEY, HEALTH_STATUS } from '@/core/constants/index.js'

export const getRoutes = (): Routes => ({
	routes: [
		{
			method: 'GET',
			url: '/health',
			handler: async (request, reply) => {
				const { cache } = request.diScope.cradle

				const health = await cache.get(HEALTH_CHECK_KEY)

				const data = {
					uptime: process.uptime(),
					date: new Date(),
				}

				if (!health) {
					await cache.set(HEALTH_CHECK_KEY, HEALTH_STATUS.HEALTHY)

					return reply
						.status(200)
						.send({ ...data, message: HEALTH_STATUS.HEALTHY })
				}

				return reply.status(200).send({ ...data, message: health })
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
		...getLinksRoutes().routes,
	],
})
