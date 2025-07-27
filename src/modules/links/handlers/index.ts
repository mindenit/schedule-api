import type { FastifyReply, FastifyRequest } from 'fastify'
import { CLIENT_COOKIE_NAME } from '../constants/index.js'
import type {
	CREATE_LINK,
	GET_LINK_BY_ID,
	UPDATE_LINK,
} from '../schemas/index.js'

export const getUserLinks = async (
	request: FastifyRequest,
	reply: FastifyReply,
): Promise<void> => {
	const userId = request.cookies[CLIENT_COOKIE_NAME] as string

	const { linksService } = request.diScope.cradle

	const data = await linksService.getUserLinks(userId)

	return reply.status(200).send(data)
}

export const createLink = async (
	request: FastifyRequest<{ Body: CREATE_LINK }>,
	reply: FastifyReply,
): Promise<void> => {
	const userId = request.cookies[CLIENT_COOKIE_NAME] as string

	const { linksService } = request.diScope.cradle

	const data = await linksService.createOne(userId, request.body)

	return reply.status(201).send(data)
}

export const updateLink = async (
	request: FastifyRequest<{ Params: GET_LINK_BY_ID; Body: UPDATE_LINK }>,
	reply: FastifyReply,
): Promise<void> => {
	const userId = request.cookies[CLIENT_COOKIE_NAME] as string

	const { id } = request.params
	const { linksService } = request.diScope.cradle

	const result = await linksService.updateOne(id, userId, request.body)

	if (result.isErr()) {
		return reply.status(result.error.error.status).send(result.error)
	}

	return reply.status(200).send(result.value)
}

export const deleteLink = async (
	request: FastifyRequest<{ Params: GET_LINK_BY_ID }>,
	reply: FastifyReply,
): Promise<void> => {
	const userId = request.cookies[CLIENT_COOKIE_NAME] as string

	const { id } = request.params
	const { linksService } = request.diScope.cradle

	const result = await linksService.deleteOne(id, userId)

	if (result.isErr()) {
		return reply.status(result.error.error.status).send(result.error)
	}

	return reply.status(200).send(result.value)
}
