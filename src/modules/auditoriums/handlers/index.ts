import {
	type GET_SCHEDULE_PARAMS,
	type GET_SCHEDULE_QUERY,
} from '@/modules/schedule/schemas/index.js'
import type { FastifyReply, FastifyRequest } from 'fastify'
import type { GET_AUDITORIUM_SCHEDULE_FILTERS } from '../schemas/index.js'

export const getAuditoriums = async (
	request: FastifyRequest,
	reply: FastifyReply,
): Promise<void> => {
	const { auditoriumsService } = request.diScope.cradle

	const data = await auditoriumsService.getAuditoriums()

	return reply.status(200).send(data)
}

export const getAuditoriumGroups = async (
	request: FastifyRequest<{
		Params: GET_SCHEDULE_PARAMS
	}>,
	reply: FastifyReply,
): Promise<void> => {
	const { auditoriumsService } = request.diScope.cradle
	const { id } = request.params

	const data = await auditoriumsService.getGroups(id)

	return reply.status(200).send(data)
}

export const getAuditoriumTeachers = async (
	request: FastifyRequest<{
		Params: GET_SCHEDULE_PARAMS
	}>,
	reply: FastifyReply,
): Promise<void> => {
	const { auditoriumsService } = request.diScope.cradle
	const { id } = request.params

	const data = await auditoriumsService.getTeachers(id)

	return reply.status(200).send(data)
}

export const getAuditoriumSubjects = async (
	request: FastifyRequest<{
		Params: GET_SCHEDULE_PARAMS
	}>,
	reply: FastifyReply,
): Promise<void> => {
	const { auditoriumsService } = request.diScope.cradle
	const { id } = request.params

	const data = await auditoriumsService.getSubjects(id)

	return reply.status(200).send(data)
}

export const getAuditoriumSchedule = async (
	request: FastifyRequest<{
		Params: GET_SCHEDULE_PARAMS
		Querystring: GET_SCHEDULE_QUERY<GET_AUDITORIUM_SCHEDULE_FILTERS>
	}>,
	reply: FastifyReply,
): Promise<void> => {
	const { auditoriumsService } = request.diScope.cradle
	const { id } = request.params

	const data = await auditoriumsService.getSchedule({ id, ...request.query })

	return reply.status(200).send(data)
}
