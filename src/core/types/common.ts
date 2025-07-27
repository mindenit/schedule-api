import type { FastifyInstance } from 'fastify'
import type http from 'node:http'

type Maybe<T> = T | undefined | null

type AppInstance = FastifyInstance<
	http.Server,
	http.IncomingMessage,
	http.ServerResponse
>

interface HttpError {
	status: number
	message: string
}

type SuccessResponse<T extends object> = {
	success: true
	data: T
	message?: string
	error: null
}

type FailureResponse = {
	success: false
	data: null
	message?: string
	error: HttpError
}

type BaseResponse<T extends object> = SuccessResponse<T> | FailureResponse

export type {
	AppInstance,
	HttpError,
	Maybe,
	BaseResponse,
	SuccessResponse,
	FailureResponse,
}
