import {
	Injectable,
	NestInterceptor,
	ExecutionContext,
	CallHandler,
	HttpException,
	InternalServerErrorException,
	Logger,
} from '@nestjs/common'
import { FastifyReply, FastifyRequest } from 'fastify'
import { Observable, throwError } from 'rxjs'
import { catchError } from 'rxjs/operators'
import { AppException } from '../exceptions/app.exception'

@Injectable()
export class ErrorsInterceptor implements NestInterceptor {
	private readonly logger: Logger = new Logger(ErrorsInterceptor.name)

	/**
	 * Intercepts the request and handles any errors that occur.
	 * @param {ExecutionContext} context - The execution context.
	 * @param {CallHandler} next - The next handler in the chain.
	 * @returns {Observable<unknown>} The observable stream.
	 */
	intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
		const request = context.switchToHttp().getRequest<FastifyRequest>()
		const response = context.switchToHttp().getResponse<FastifyReply>()

		return next.handle().pipe(
			catchError((err: unknown) =>
				throwError(() => {
					this.logError(err, request, response)
					this.recordErrorMetrics()
					return this.transformError(err)
				}),
			),
		)
	}

	/**
	 * Logs error.
	 * @param {unknown} error - The error to log.
	 * @param {FastifyRequest} request - The request object.
	 * @param {FastifyReply} reply - The response object.
	 */
	private logError(
		error: unknown,
		request: FastifyRequest,
		reply: FastifyReply,
	): void {
		const errorInfo = this.extractErrorInfo(error)
		const requestInfo = this.extractRequestInfo(request)

		this.logger.error('request-error', {
			error: errorInfo,
			request: requestInfo,
			response: {
				statusCode: reply.statusCode,
			},
			timestamp: new Date().toISOString(),
		})
	}

	/**
	 * Extracts error information for logging.
	 * @param {unknown} error - The error to extract information from.
	 * @returns {Record<string, unknown>} The extracted error information.
	 */
	private extractErrorInfo(error: unknown): Record<string, unknown> {
		if (error instanceof AppException) {
			return {
				type: 'AppException',
				code: error.code,
				message: error.message,
				status: error.getStatus(),
				details: error.details,
			}
		}

		if (error instanceof HttpException) {
			return {
				type: 'HttpException',
				message: error.message,
				status: error.getStatus(),
			}
		}

		if (error instanceof Error) {
			return {
				type: 'Error',
				name: error.name,
				message: error.message,
				cause: error.cause,
			}
		}

		return {
			type: 'Unknown',
			error: String(error),
		}
	}

	/**
	 * Extracts request information for logging.
	 * @param {FastifyRequest} request - The request object.
	 * @returns {Record<string, unknown>} The extracted request information.
	 */
	private extractRequestInfo(request: FastifyRequest): Record<string, unknown> {
		return {
			method: request.method,
			url: request.url,
			query: request.query,
			params: request.params,
		}
	}

	/**
	 * Records error metrics for monitoring.
	 */
	private recordErrorMetrics(): void {
		// TODO: Implement
	}

	/**
	 * Transforms error to appropriate HTTP exception.
	 * @param {unknown} error - The error to transform.
	 * @returns {HttpException} The transformed HTTP exception.
	 */
	private transformError(error: unknown): HttpException {
		if (error instanceof AppException) {
			return error
		}

		if (error instanceof HttpException) {
			return error
		}

		if (error instanceof Error) {
			return new InternalServerErrorException({
				message: 'Internal server error',
				error: 'InternalServerError',
				statusCode: 500,
				details: {
					originalMessage: error.message,
					originalName: error.name,
				},
			})
		}

		return new InternalServerErrorException({
			message: 'Internal server error',
			error: 'InternalServerError',
			statusCode: 500,
			details: {
				originalError: String(error),
			},
		})
	}
}
