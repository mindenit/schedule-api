import { SCHEDULE_TYPE } from '@/core/constants/parsers.js'
import { HEALTH_CHECK_SCHEMA } from '@/core/schemas/index.js'
import type { Routes } from '@/core/types/routes.js'
import { delay } from '@/core/utils/proxy.js'

export const getRoutes = (): Routes => {
	return {
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
			// TODO: Remove after the end of testing period
			{
				method: 'POST',
				url: '/test',
				handler: async (request, reply) => {
					const {
						auditoriumsProcessor,
						groupsProcessor,
						eventsProcessor,
						teachersProcessor,
					} = request.diScope.cradle

					const [auditoriums, groups, teachers] = await Promise.all([
						auditoriumsProcessor.process(),
						groupsProcessor.process(),
						teachersProcessor.process(),
					])

					if (!auditoriums || !groups || !teachers) {
						return reply.status(500)
					}

					for (const group of groups) {
						await eventsProcessor.process(group.id, SCHEDULE_TYPE.GROUP)

						delay(3000)
					}
				},
			},
		],
	}
}
