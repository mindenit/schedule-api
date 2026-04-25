import type { FastifyReply, FastifyRequest } from 'fastify'
import type { GetCourse, MoodleLogin } from '../schemas/index.js'
import { setMoodleTokenCookie } from '../utils/index.js'
import { HTTP_STATUS } from '@/core/constants/http.js'
import { successResponse } from '@/core/utils/response.js'

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
	const { token } = request.moodleAuth

	const siteInfo = await moodleService.getSiteInfo(token)

	if (siteInfo.isErr()) {
		const error = siteInfo.error

		return reply
			.status(error.status ?? HTTP_STATUS.INTERNAL_SERVER_ERR)
			.send(error)
	}

	return reply.status(HTTP_STATUS.OK).send(siteInfo.unwrap())
}

export const getCourses = async (
	request: FastifyRequest,
	reply: FastifyReply,
): Promise<void> => {
	const { moodleService } = request.diScope.cradle
	const { token, userId } = request.moodleAuth

	const courses = await moodleService.getUserCourses({ token, userId })

	if (courses.isErr()) {
		const error = courses.error

		return reply
			.status(error.status ?? HTTP_STATUS.INTERNAL_SERVER_ERR)
			.send(error)
	}

	return reply.status(HTTP_STATUS.OK).send(courses.unwrap())
}

export const getCourseGrades = async (
	request: FastifyRequest<{ Params: GetCourse }>,
	reply: FastifyReply,
): Promise<void> => {
	const { moodleService } = request.diScope.cradle
	const { courseId } = request.params
	const { token, userId } = request.moodleAuth

	const grades = await moodleService.getCourseGrades({
		token,
		courseId,
		userId,
	})

	if (grades.isErr()) {
		const error = grades.error

		return reply.status(error.status).send(error)
	}

	return reply.status(HTTP_STATUS.OK).send(grades.unwrap())
}

export const getCourseAssignments = async (
	request: FastifyRequest<{ Params: GetCourse }>,
	reply: FastifyReply,
): Promise<void> => {
	const { moodleService } = request.diScope.cradle
	const { courseId } = request.params
	const { token } = request.moodleAuth

	const assignments = await moodleService.getCourseAssignments({
		token,
		courseId,
	})

	if (assignments.isErr()) {
		const error = assignments.error

		return reply.status(error.status).send(error)
	}

	return reply.status(HTTP_STATUS.OK).send(assignments.unwrap())
}

export const getCourseContent = async (
	request: FastifyRequest<{ Params: GetCourse }>,
	reply: FastifyReply,
): Promise<void> => {
	const { moodleService } = request.diScope.cradle
	const { courseId } = request.params
	const { token } = request.moodleAuth

	const content = await moodleService.getCourseContent({
		token,
		courseId,
	})

	if (content.isErr()) {
		const error = content.error

		return reply.status(error.status).send(error)
	}

	return reply.status(HTTP_STATUS.OK).send(content.unwrap())
}
