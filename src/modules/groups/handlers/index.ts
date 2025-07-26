import type { GET_ENTITY_BY_ID } from '@/core/schemas/index.js'
import {
	type GET_SCHEDULE_PARAMS,
	type GET_SCHEDULE_QUERY,
} from '@/modules/schedule/schemas/index.js'
import type { FastifyReply, FastifyRequest } from 'fastify'
import type { GET_GROUP_SCHEDULE_FILTERS } from '../schemas/index.js'

export const getGroups = async (
	request: FastifyRequest,
	reply: FastifyReply,
): Promise<void> => {
	const { groupsService } = request.diScope.cradle

	const data = await groupsService.getAll()

	return reply.status(200).send(data)
}

export const getGroupAuditoriums = async (
	request: FastifyRequest<{ Params: GET_ENTITY_BY_ID }>,
	reply: FastifyReply,
): Promise<void> => {
	const { groupsService } = request.diScope.cradle
	const { id } = request.params

	const data = await groupsService.getAuditoriums(id)

	return reply.status(200).send(data)
}

export const getGroupSchedule = async (
	request: FastifyRequest<{
		Params: GET_SCHEDULE_PARAMS
		Querystring: GET_SCHEDULE_QUERY<GET_GROUP_SCHEDULE_FILTERS>
	}>,
	reply: FastifyReply,
): Promise<void> => {
	const { groupsService } = request.diScope.cradle
	const { id } = request.params

	const data = await groupsService.getSchedule({ id, ...request.query })

	return reply.status(200).send(data)
}

export const getGroupSubjects = async (
	request: FastifyRequest<{ Params: GET_ENTITY_BY_ID }>,
	reply: FastifyReply,
): Promise<void> => {
	const { groupsService } = request.diScope.cradle
	const { id } = request.params

	const data = await groupsService.getSubjects(id)

	return reply.status(200).send(data)
}

export const getGroupTeachers = async (
	request: FastifyRequest<{ Params: GET_ENTITY_BY_ID }>,
	reply: FastifyReply,
): Promise<void> => {
	const { groupsService } = request.diScope.cradle
	const { id } = request.params

	const data = await groupsService.getTeachers(id)

	return reply.status(200).send(data)
}
