import {
	ArgumentsHost,
	Catch,
	ExceptionFilter,
	HttpException,
	HttpStatus,
} from '@nestjs/common'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { ZodSerializationException } from 'nestjs-zod'
import { Temporal } from 'temporal-polyfill'
import z, { ZodError } from 'zod'

import { AppException } from '../exceptions/app.exception'
import { CommonErrorCodes } from '../exceptions/error-codes'

@Catch()
export class GlobalExceptionFilter<T> implements ExceptionFilter<T> {
	catch(exception: T, host: ArgumentsHost) {
		const ctx = host.switchToHttp()
		const request = ctx.getRequest<FastifyRequest>()
		const reply = ctx.getResponse<FastifyReply>()

		// Handle ZodSerializationException.
		if (this.isZodException(exception)) {
			this.handleZodException(exception, reply, request)
			return
		}

		// Handle AppException.
		if (this.isAppException(exception)) {
			this.handleAppException(exception, reply, request)
			return
		}

		// Handle HttpException.
		if (exception instanceof HttpException) {
			this.handleHttpException(exception, reply, request)
			return
		}

		// Handle generic errors.
		this.handleGenericError(exception, reply, request)
	}

	private handleZodException(
		exception: ZodSerializationException,
		reply: FastifyReply,
		request: FastifyRequest,
	): void {
		const status = exception.getStatus()
		const zodError = exception.getZodError()

		const base = {
			code: CommonErrorCodes.FAILED_VALIDATION,
			timestamp: Temporal.Now.plainDateISO(),
			path: request.url,
		}

		const error =
			zodError instanceof ZodError
				? {
						...base,
						message: 'Validation failed',
						details: z.treeifyError(zodError),
					}
				: {
						...base,
						message: 'Unknown validation error',
					}

		reply.status(status).send({ success: false, error })
	}

	/**
	 * Handle AppException.
	 * @param {AppException} exception - The exception to handle.
	 * @param {FastifyReply} reply - The response object.
	 * @param {FastifyRequest} request - The request object.
	 */
	private handleAppException(
		exception: AppException,
		reply: FastifyReply,
		request: FastifyRequest,
	): void {
		const status = exception.getStatus()

		const errorResponse = {
			success: false,
			error: {
				code: exception.code,
				message: exception.message,
				details: exception.details,
				timestamp: Temporal.Now.plainDateISO(),
				path: request.url,
			},
		}

		reply.status(status).send(errorResponse)
	}

	/**
	 * Handle HttpException.
	 * @param {HttpException} exception - The exception to handle.
	 * @param {FastifyReply} reply - The response object.
	 * @param {FastifyRequest} request - The request object.
	 */
	private handleHttpException(
		exception: HttpException,
		reply: FastifyReply,
		request: FastifyRequest,
	): void {
		const status = exception.getStatus()
		const exceptionResponse = exception.getResponse()

		let message: string
		let details: unknown

		if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
			const responseObj = exceptionResponse as Record<string, unknown>
			message = (responseObj.message as string) || exception.message
			details = responseObj
		} else {
			message = exception.message
		}

		const errorResponse = {
			success: false,
			error: {
				message,
				details,
				timestamp: Temporal.Now.plainDateISO(),
				path: request.url,
			},
		}

		reply.status(status).send(errorResponse)
	}

	/**
	 * Handle generic errors.
	 * @param {unknown} exception - The exception to handle.
	 * @param {FastifyReply} reply - The response object.
	 * @param {FastifyRequest} request - The request object.
	 */
	private handleGenericError(
		exception: unknown,
		reply: FastifyReply,
		request: FastifyRequest,
	): void {
		const message =
			exception instanceof Error ? exception.message : 'Internal Server Error'
		const details =
			exception instanceof Error ? { stack: exception.stack } : undefined

		const errorResponse = {
			success: false,
			error: {
				message,
				details,
				timestamp: Temporal.Now.plainDateISO(),
				path: request.url,
			},
		}

		reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send(errorResponse)
	}

	/**
	 * Type guard to check if exception is AppException.
	 * @param {unknown} exception - The exception to check.
	 * @returns {boolean} True if the exception is an AppException, false otherwise.
	 */
	private isAppException(exception: unknown): exception is AppException {
		return exception instanceof AppException
	}

	/**
	 * Type guard to check if exception is ZodSerializationException.
	 * @param {unknown} exception - The exception to check.
	 * @returns {boolean} True if the exception is an ZodSerializationException, false otherwise.
	 */
	private isZodException(
		exception: unknown,
	): exception is ZodSerializationException {
		return exception instanceof ZodSerializationException
	}
}
