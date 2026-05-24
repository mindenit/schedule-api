import { AppException } from 'src/common/exceptions/app.exception'
import { PromiseResult } from 'src/common/types'

export interface CistProcessor<
	T extends object,
	E extends AppException<string>,
	A = never,
> {
	process: (args: A) => PromiseResult<T, E>
}
