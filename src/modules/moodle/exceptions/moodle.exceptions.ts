import { HttpException } from '@/core/exceptions/http.exception.js'
import type { MoodleExceptionCode } from './error-codes.js'
import { HTTP_STATUS } from '@/core/constants/http.js'

export class MoodleOperationException extends HttpException<MoodleExceptionCode> {
	constructor(
		code: MoodleExceptionCode,
		message?: string,
		status: number = HTTP_STATUS.INTERNAL_SERVER_ERR,
	) {
		super(code, message, status)
	}
}
