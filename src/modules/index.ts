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
						auditoriumsService,
						auditoriumsParser,
						groupsService,
						groupsParser,
						teachersService,
						teachersParser,
						eventsParser,
						eventsService,
					} = request.diScope.cradle

					const [auditoriums, groups, teachers] = await Promise.all([
						auditoriumsParser.parse(),
						groupsParser.parse(),
						teachersParser.parse(),
					])

					if (!auditoriums || !groups || !teachers) {
						return reply.status(500)
					}

					await auditoriumsService.processParsedJSON(auditoriums)
					await groupsService.processParsedJSON(groups)
					await teachersService.processParsedJSON(teachers)

					for (const group of groups.groups) {
						const events = await eventsParser.parse(
							group.id,
							SCHEDULE_TYPE.GROUP,
						)

						if (!events) {
							continue
						}

						await eventsService.processParsedJSON(events)

						delay(3000)
					}

					for (const auditorium of auditoriums.auditoriums) {
						const events = await eventsParser.parse(
							auditorium.id,
							SCHEDULE_TYPE.AUDITORIUM,
						)

						if (!events) {
							continue
						}

						await eventsService.processParsedJSON(events)

						delay(3000)
					}

					for (const auditorium of teachers.teachers) {
						const events = await eventsParser.parse(
							auditorium.id,
							SCHEDULE_TYPE.TEACHER,
						)

						if (!events) {
							continue
						}

						await eventsService.processParsedJSON(events)

						delay(3000)
					}
				},
			},
		],
	}
}
