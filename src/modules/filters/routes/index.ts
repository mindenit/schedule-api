import type { AppInstance } from '@/core/types/common.js'
import type { Routes } from '@/core/types/routes.js'

export const getFiltersRoutes = (app: AppInstance): Routes => ({
	routes: [
		{
			method: 'GET',
			url: '/filters',
			// @ts-expect-error missing types for verifyLogto middleware
			preHandler: app.verifyLogto,
			handler: async (request, reply) => {
				const userInfo = request.logToUser

				return reply.send({ user: userInfo })
			},
		},
	],
})
