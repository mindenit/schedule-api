import type {
	FailureResponse,
	HttpError,
	SuccessResponse,
} from '../types/common.js'

export const successResponse = <T extends object>(
	data: T,
	message: string,
): SuccessResponse<T> => ({
	success: true,
	data,
	message,
	error: null,
})

export const failureResponse = (error: HttpError): FailureResponse => ({
	success: false,
	data: null,
	error,
})
