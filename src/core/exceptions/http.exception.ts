export class HttpException<T extends string = string> extends Error {
	constructor(
		public readonly code: T,
		message?: string,
		public readonly status: number = 500,
	) {
		super(message)
		this.code = code
		this.status = status
	}

	toJSON() {
		return {
			code: this.code,
			message: this.message,
			status: this.status,
		}
	}
}
