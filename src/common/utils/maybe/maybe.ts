class Some<T> {
	readonly tag = 'some'
	value: T

	constructor(value: T) {
		this.value = value
	}

	/*
	 * Returns `true` if the value is `some`, `false` otherwise.
	 */
	isNone(): this is None {
		return false
	}

	/*
	 * Returns `true` if the value is `some`, `false` otherwise.
	 */
	isSome(): this is Some<T> {
		return true
	}
}

class None {
	readonly tag = 'none'

	isNone(): this is None {
		return true
	}

	isSome(): this is Some<never> {
		return false
	}
}

type Maybe<T> = Some<T> | None

/*
 * Checks if the value is Some.
 * @param {Maybe<T>} maybe The value to check.
 * @returns {boolean} `true` if the value is `some`, `false` otherwise.
 */
const isSome = <T>(maybe: Maybe<T>): maybe is Some<T> => maybe.tag === 'some'

/*
 * Checks if the value is None.
 * @param {Maybe<T>} maybe The value to check.
 * @returns {boolean} `true` if the value is `none`, `false` otherwise.
 */
const isNone = <T>(maybe: Maybe<T>): maybe is None => maybe.tag === 'none'

/*
 * Converts a nullable value to a `Maybe` type.
 * @param {T | null | undefined} value The value to convert.
 * @returns {Maybe<NonNullable<T>>} A `Maybe` type representing the value.
 */
const fromNullable = <T>(
	value: T | null | undefined,
): Maybe<NonNullable<T>> => {
	return value != null ? new Some(value) : new None()
}

/*
 * Converts a throwable function to return a `Maybe` type.
 * @param {Function} f The function to convert.
 * @returns {Maybe<NonNullable<T>>} A `Maybe` type representing the value.
 */
const fromThrowable = <T>(
	f: () => T | null | undefined,
): Maybe<NonNullable<T>> => {
	try {
		return new Some(f() as NonNullable<T>)
	} catch {
		return new None()
	}
}

/*
 * Lifts a nullable function to return a `Maybe` type.
 * @param {Function} f The function to lift.
 * @returns {Function} A function that returns a `Maybe` type.
 */
const liftNullable =
	<A extends readonly unknown[], B>(
		f: (...a: A) => B | null | undefined,
	): ((...a: A) => Maybe<NonNullable<B>>) =>
	(...a) =>
		fromNullable(f(...a))

/*
 * Lifts a throwable function to return a `Maybe` type.
 * @param {Function} f The function to lift.
 * @returns {Function} A function that returns a `Maybe` type.
 */
const liftThrowable = <A extends readonly unknown[], B>(
	f: (...a: A) => B | null | undefined,
): ((...a: A) => Maybe<NonNullable<B>>) => {
	return (...a) => {
		try {
			return fromNullable(f(...a))
		} catch {
			return new None()
		}
	}
}

/*
 * Returns the value if it is `some`, `null` otherwise.
 * @param {Maybe<T>} maybe The value to get.
 * @returns {T | null} The value if it is `some`, `null` otherwise.
 */
const getOrNull = <T>(maybe: Maybe<T>): T | null =>
	maybe.tag === 'some' ? maybe.value : null

/*
 * Returns the value if it is `some`, `undefined` otherwise.
 * @param {Maybe<T>} maybe The value to get.
 * @returns {T | undefined} The value if it is `some`, `undefined` otherwise.
 */
const getOrUndefined = <T>(maybe: Maybe<T>): T | undefined =>
	maybe.tag === 'some' ? maybe.value : undefined

/*
 * Returns the value if it is `some`, the default value otherwise.
 * @param {Maybe<T>} maybe The value to get.
 * @param {T} defaultValue The default value to return if the value is `none`.
 * @returns {T} The value if it is `some`, the default value otherwise.
 */
const getOrElse = <T>(maybe: Maybe<T>, defaultValue: T): T =>
	maybe.tag === 'some' ? maybe.value : defaultValue

export {
	fromNullable,
	fromThrowable,
	getOrElse,
	getOrNull,
	getOrUndefined,
	isNone,
	isSome,
	liftNullable,
	liftThrowable,
	type Maybe,
}
