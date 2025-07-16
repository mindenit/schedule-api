import {
	type GET_SCHEDULE_PARAMS,
	type GET_SCHEDULE_QUERY,
} from '@/modules/schedule/schemas/index.js'
import type { FastifyReply, FastifyRequest } from 'fastify'

export const getAuditoriums = async (
	request: FastifyRequest,
	reply: FastifyReply,
): Promise<void> => {
	const { auditoriumsService } = request.diScope.cradle

	const data = await auditoriumsService.getAuditoriums()

	return reply.status(200).send(data)
}

export const getAuditoriumSchedule = async (
	request: FastifyRequest<{
		Params: GET_SCHEDULE_PARAMS
		Querystring: GET_SCHEDULE_QUERY
	}>,
	reply: FastifyReply,
): Promise<void> => {
	const { auditoriumsService } = request.diScope.cradle
	const { id } = request.params

	const data = await auditoriumsService.getSchedule({ id, ...request.query })

	return reply.status(200).send(data)
}
