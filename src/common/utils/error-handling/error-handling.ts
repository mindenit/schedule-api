import { HttpStatus } from '@nestjs/common'
import { Result } from 'better-result'
import { AppException } from 'src/common/exceptions/app.exception'
import { CommonErrorCodes } from 'src/common/exceptions/error-codes'
import { PromiseResult } from 'src/common/types'

type UnknownException = AppException<typeof CommonErrorCodes.UNKNOWN_EXCEPTION>

/*
 * Attempts to execute an async thunk and handles any errors by mapping them to an AppException or UnknownException.
 * @param {() => Promise<A>} thunk The async thunk to execute.
 * @param {E} errorClass The error class to use for mapping errors, or undefined to use the default UnknownException.
 * @returns {PromiseResult<A, E | UnknownException>} PromiseResult containing the result of the thunk or an AppException/UnknownException.
 */
export const attemptAsync = async <A, E extends AppException>(
	thunk: () => Promise<A>,
	errorClass?: E,
): PromiseResult<A, E | UnknownException> => {
	const result = await Result.tryPromise(thunk)

	return result.mapError<E | UnknownException>((e: unknown) =>
		errorClass
			? errorClass
			: new AppException(
					CommonErrorCodes.UNKNOWN_EXCEPTION,
					e instanceof Error ? e.message : 'Unknown error',
					HttpStatus.INTERNAL_SERVER_ERROR,
					{ cause: e },
				),
	)
}
