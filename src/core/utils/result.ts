interface ISuccess<T> {
	success: true
	value: T
}

interface IFailure<E> {
	success: false
	error: E
}

type Result<T, E> = ISuccess<T> | IFailure<E>

const Success = <T>(value: T): ISuccess<T> => ({
	success: true,
	value,
})

const Failure = <E>(error: E): IFailure<E> => ({
	success: false,
	error,
})

export { Success, Failure, type Result }
