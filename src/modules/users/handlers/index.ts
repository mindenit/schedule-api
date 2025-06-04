import type { FastifyReply, FastifyRequest } from 'fastify'
import type { CREATE_USER_TYPE } from '../schemas/index.js'
import { throwHttpError } from '@/core/utils/common.js'

export const getUsers = async (
	request: FastifyRequest,
	reply: FastifyReply,
): Promise<void> => {
	const { usersRepository } = request.diScope.cradle

	const users = await usersRepository.findAll()

	return reply.status(200).send(users)
}

export const createUser = async (
	request: FastifyRequest<{ Body: CREATE_USER_TYPE }>,
	reply: FastifyReply,
) => {
	const { usersRepository } = request.diScope.cradle

	const result = await usersRepository.createOne(request.body)

	if (!result.success) return throwHttpError(reply, result.error)

	return reply.status(201).send(result.value)
}
