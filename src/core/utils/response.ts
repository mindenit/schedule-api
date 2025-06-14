import type { BaseResponse } from '../types/common.js'

export const success = <T extends object>(
	data: T,
	message: string,
): BaseResponse<T> => ({
	success: true,
	data,
	message,
	error: null,
})
