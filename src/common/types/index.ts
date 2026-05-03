import { Result } from 'better-result'
import { AppException } from '../exceptions/app.exception'

type PromiseResult<T, E extends AppException> = Promise<Result<T, E>>
type Maybe<T> = T | null | undefined

export type { PromiseResult, Maybe }
