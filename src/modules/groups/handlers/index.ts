import type {
	GET_SCHEDULE_PARAMS,
	GET_SCHEDULE_QUERY,
} from '@/modules/schedule/schemas/index.js'
import type { FastifyReply, FastifyRequest } from 'fastify'

export const getGroups = async (
	request: FastifyRequest,
	reply: FastifyReply,
): Promise<void> => {
	const { groupsService } = request.diScope.cradle

	const data = await groupsService.getAll()

	return reply.status(200).send(data)
}

export const getGroupSchedule = async (
	request: FastifyRequest<{
		Params: GET_SCHEDULE_PARAMS
		Querystring: GET_SCHEDULE_QUERY
	}>,
	reply: FastifyReply,
): Promise<void> => {
	const { groupsService } = request.diScope.cradle
	const { id } = request.params

	const data = await groupsService.getSchedule({ id, ...request.query })

	return reply.status(200).send(data)
}
