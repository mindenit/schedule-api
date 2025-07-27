import { failureResponse } from '@/core/utils/index.js'
import type { FastifyReply } from 'fastify'
import type { FastifyRequest } from 'fastify/types/request.js'
import { CLIENT_COOKIE_NAME } from '../constants/index.js'

export const sessionMiddleware = async (
	request: FastifyRequest,
	reply: FastifyReply,
): Promise<void> => {
	const userId = request.cookies[CLIENT_COOKIE_NAME]

	if (!userId) {
		return reply
			.status(401)
			.send(failureResponse({ status: 401, message: 'Unauthorized' }))
	}
}
