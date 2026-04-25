import type { Result } from 'better-result'
import type { FastifyInstance } from 'fastify'
import type http from 'node:http'

type Maybe<T> = T | undefined | null

type Bit = 0 | 1

type PromiseResult<T, E> = Promise<Result<T, E>>

interface EntityMapper<From, To> {
	toEntity: (from: From) => To
}

type AppInstance = FastifyInstance<
	http.Server,
	http.IncomingMessage,
	http.ServerResponse
>

interface HttpError {
	status: number
	message: string
}

type SuccessResponse<T> = {
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

type HttpExceptionOverrides = {
	message: string | null
	status: number
}

type HttpExceptionMap<K extends string> = Partial<
	Record<K, HttpExceptionOverrides>
>

export type {
	AppInstance,
	BaseResponse,
	Bit,
	EntityMapper,
	FailureResponse,
	HttpError,
	HttpExceptionMap,
	HttpExceptionOverrides,
	Maybe,
	PromiseResult,
	SuccessResponse,
}
