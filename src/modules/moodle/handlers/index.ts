import type { FastifyReply, FastifyRequest } from 'fastify'
import type { GetCourse, MoodleLogin } from '../schemas/index.js'
import { setMoodleTokenCookie } from '../utils/index.js'
import { HTTP_STATUS } from '@/core/constants/http.js'
import { successResponse } from '@/core/utils/response.js'
import { MOODLE_TOKEN_COOKIE_NAME } from '../constant/index.js'

export const moodleLogin = async (
	request: FastifyRequest<{ Body: MoodleLogin }>,
	reply: FastifyReply,
): Promise<void> => {
	const { moodleService } = request.diScope.cradle

	const result = await moodleService.login(request.body)

	if (result.isErr()) {
		const error = result.error

		return reply.status(error.status).send(error)
	}

	const { token } = result.unwrap()

	setMoodleTokenCookie(reply, token)

	return reply
		.status(HTTP_STATUS.OK)
		.send(successResponse({ token }, 'Login successful'))
}

export const getSiteInfo = async (
	request: FastifyRequest,
	reply: FastifyReply,
): Promise<void> => {
	const { moodleService } = request.diScope.cradle

	const token = request.cookies[MOODLE_TOKEN_COOKIE_NAME]

	if (!token) {
		return reply.status(HTTP_STATUS.UNAUTHORIZED).send({
			message: 'Authentication token is missing',
		})
	}

	try {
		const siteInfo = await moodleService.getSiteInfo(token)

		return reply.status(HTTP_STATUS.OK).send(siteInfo.unwrap())
	} catch (error) {
		return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERR).send({
			message: 'Failed to fetch site info',
			error: error instanceof Error ? error.message : String(error),
		})
	}
}

export const getCourses = async (
	request: FastifyRequest,
	reply: FastifyReply,
): Promise<void> => {
	const { moodleService } = request.diScope.cradle

	const token = request.cookies[MOODLE_TOKEN_COOKIE_NAME]

	if (!token) {
		return reply.status(HTTP_STATUS.UNAUTHORIZED).send({
			message: 'Authentication token is missing',
		})
	}

	try {
		const courses = await moodleService.getUserCourses({ token, userId: 26170 })

		return reply.status(HTTP_STATUS.OK).send(courses.unwrap())
	} catch (error) {
		return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERR).send({
			message: 'Failed to fetch courses',
			error: error instanceof Error ? error.message : String(error),
		})
	}
}

export const getCourseGrades = async (
	request: FastifyRequest<{ Params: GetCourse }>,
	reply: FastifyReply,
): Promise<void> => {
	const { moodleService } = request.diScope.cradle
	const { courseId } = request.params
	const token = request.cookies[MOODLE_TOKEN_COOKIE_NAME]

	if (!token) {
		return reply.status(HTTP_STATUS.UNAUTHORIZED).send({
			message: 'Authentication token is missing',
		})
	}

	try {
		const grades = await moodleService.getCourseGrades({
			token,
			courseId,
			userId: 26170,
		})

		if (grades.isErr()) {
			const error = grades.error

			return reply
				.status(error.status ?? HTTP_STATUS.INTERNAL_SERVER_ERR)
				.send(error)
		}

		return reply.status(HTTP_STATUS.OK).send(grades.unwrap())
	} catch (error) {
		return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERR).send({
			message: 'Failed to fetch course grades',
			error: error instanceof Error ? error.message : String(error),
		})
	}
}
