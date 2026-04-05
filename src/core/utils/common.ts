import type { FastifyReply } from 'fastify'
import { HTTP_STATUS } from '../constants/http.js'
import type { HttpError, HttpExceptionMap } from '../types/index.js'

const throwHttpError = (reply: FastifyReply, error: HttpError) => {
	const { status, message } = error

	return reply.status(status).send({ message })
}

const getContentType = (response: Response): string => {
	return response.headers.get('content-type') || ''
}

const mapHttpException = <K extends string>(
	code: K,
	map: HttpExceptionMap<K>,
) => {
	return (
		map[code] ?? {
			message: null,
			status: HTTP_STATUS.INTERNAL_SERVER_ERR,
		}
	)
}

export { getContentType, mapHttpException, throwHttpError }
