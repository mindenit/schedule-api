interface ISuccess<T> {
	successResponse: true
	value: T
}

interface IFailure<E> {
	successResponse: false
	error: E
}

type Result<T, E> = ISuccess<T> | IFailure<E>

const Success = <T>(value: T): ISuccess<T> => ({
	suc: true,
	value,
})

const Failure = <E>(error: E): IFailure<E> => ({
	successResponse: false,
	error,
})

export { Success, Failure, type Result }
