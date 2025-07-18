import {
	type GET_SCHEDULE_PARAMS,
	type GET_SCHEDULE_QUERY,
} from '@/modules/schedule/schemas/index.js'
import type { FastifyReply, FastifyRequest } from 'fastify'

export const getTeachers = async (
	request: FastifyRequest,
	reply: FastifyReply,
): Promise<void> => {
	const { teachersService } = request.diScope.cradle

	const data = await teachersService.getAll()

	return reply.status(200).send(data)
}

export const getTeacherSchedule = async (
	request: FastifyRequest<{
		Params: GET_SCHEDULE_PARAMS
		Querystring: GET_SCHEDULE_QUERY
	}>,
	reply: FastifyReply,
): Promise<void> => {
	const { teachersService } = request.diScope.cradle
	const { id } = request.params

	console.log(request.query)

	const data = await teachersService.getSchedule({ id, ...request.query })

	return reply.status(200).send(data)
}
