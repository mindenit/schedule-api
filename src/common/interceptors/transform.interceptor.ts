import {
	CallHandler,
	ExecutionContext,
	Injectable,
	NestInterceptor,
	StreamableFile,
} from '@nestjs/common'
import { Result } from 'better-result'
import { map, Observable } from 'rxjs'

@Injectable()
export class TransformInterceptor implements NestInterceptor<unknown, unknown> {
	/**
	 * Intercepts the request and transforms the data.
	 * @param {ExecutionContext} _context - The execution context.
	 * @param {CallHandler} next - The next handler in the chain.
	 * @returns {Observable<unknown>} The observable stream.
	 */
	intercept(
		_context: ExecutionContext,
		next: CallHandler,
	): Observable<unknown> {
		return next.handle().pipe(
			map((data: unknown) => {
				if (data instanceof StreamableFile) {
					return data
				}

				if (!this.isResult(data)) {
					return { success: true, data, error: null }
				}

				if (data.isErr()) {
					throw data.error
				}

				return { success: true, data: data.unwrap(), error: null }
			}),
		)
	}

	private isResult(data: unknown): data is Result<unknown, unknown> {
		const acceptedStatuses = ['ok', 'err']

		if (typeof data !== 'object' || data === null) {
			return false
		}

		if (!('status' in data) || typeof data.status !== 'string') {
			return false
		}

		return acceptedStatuses.includes(data.status)
	}
}
