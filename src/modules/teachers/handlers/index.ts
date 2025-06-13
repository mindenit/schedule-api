import type { FastifyReply, FastifyRequest } from 'fastify'

export const getTeachers = async (
	request: FastifyRequest,
	reply: FastifyReply,
): Promise<void> => {
	const { teachersService } = request.diScope.cradle

	const data = await teachersService.getAll()

	return reply.status(200).send(data)
}
