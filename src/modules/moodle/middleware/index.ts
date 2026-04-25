import { HTTP_STATUS } from '@/core/constants/http.js'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { MOODLE_TOKEN_COOKIE_NAME } from '../constant/index.js'

export interface MoodleAuthData {
	token: string
	userId: number
}

export const moodleAuthMiddleware = async (
	request: FastifyRequest,
	reply: FastifyReply,
): Promise<void> => {
	const token = request.cookies[MOODLE_TOKEN_COOKIE_NAME]

	if (!token) {
		return reply.status(HTTP_STATUS.UNAUTHORIZED).send({
			message: 'Moodle authentication token is missing',
		})
	}

	const { moodleService } = request.diScope.cradle
	const result = await moodleService.getSiteInfo(token)

	if (result.isErr()) {
		const error = result.error
		return reply
			.status(error.status ?? HTTP_STATUS.UNAUTHORIZED)
			.send({ message: error.message })
	}

	const { userId } = result.unwrap()

	request.moodleAuth = { token, userId }
}

declare module 'fastify' {
	interface FastifyRequest {
		moodleAuth: MoodleAuthData
	}
}
