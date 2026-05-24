import { Result } from 'better-result'
import { AppException } from 'src/common/exceptions/app.exception'

export interface CistParser<
	T extends object,
	E extends AppException,
	A = never,
> {
	parse: (args: A) => Promise<Result<T, E>>
}
