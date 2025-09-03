import { HEALTH_CHECK_SCHEMA } from '@/core/schemas/index.js'
import type { Routes } from '@/core/types/routes.js'
import { getAuditoriumsRoutes } from './auditoriums/routes/index.js'
import { getGroupsRoutes } from './groups/routes/index.js'
import { getTeachersRoutes } from './teachers/routes/index.js'
import { getLinksRoutes } from './links/routes/index.js'
import {
	HEALTH_CHECK_KEY,
	HEALTH_STATUS,
	LAST_UPDATE_KEY,
} from '@/core/constants/index.js'
import { getFiltersRoutes } from './filters/routes/index.js'
import type { AppInstance } from '@/core/types/common.js'

export const getRoutes = (app: AppInstance): Routes => ({
	routes: [
		{
			method: 'GET',
			url: '/health',
			handler: async (request, reply) => {
				const { cache } = request.diScope.cradle

				const health = await cache.get(HEALTH_CHECK_KEY)
				const lastUpdated = await cache.get(LAST_UPDATE_KEY)

				const data = {
					uptime: process.uptime(),
				}

				if (!health || !lastUpdated) {
					if (!health) {
						await cache.set(HEALTH_CHECK_KEY, HEALTH_STATUS.HEALTHY)
					}

					if (!lastUpdated) {
						await cache.set(LAST_UPDATE_KEY, new Date().toISOString())
					}

					return reply.status(200).send({
						...data,
						message: health ? health : HEALTH_STATUS.HEALTHY,
						lastUpdated: lastUpdated ? new Date(lastUpdated) : new Date(),
					})
				}

				return reply.status(200).send({
					...data,
					message: health,
					lastUpdated: new Date(lastUpdated),
				})
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
		...getFiltersRoutes(app).routes,
	],
})
