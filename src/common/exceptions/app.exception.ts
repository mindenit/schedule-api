import { HttpException, HttpStatus } from '@nestjs/common'

export class AppException<T extends string = string> extends HttpException {
	constructor(
		public readonly code: T,
		message: string,
		status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
		public readonly details?: Record<string, unknown>,
	) {
		super({ code, message, details }, status)
	}
}
