import type { FastifyReply, FastifyRequest } from 'fastify'

export const getAuditoriums = async (
	request: FastifyRequest,
	reply: FastifyReply,
): Promise<void> => {
	const { auditoriumsService } = request.diScope.cradle

	const data = await auditoriumsService.getAuditoriums()

	return reply.status(200).send(data)
}
