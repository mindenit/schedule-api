import type { FastifyReply, FastifyRequest } from 'fastify'

export const getGroups = async (
	request: FastifyRequest,
	reply: FastifyReply,
): Promise<void> => {
	const { groupsService } = request.diScope.cradle

	const data = await groupsService.getAll()

	return reply.status(200).send(data)
}
