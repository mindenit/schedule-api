import type { HttpError } from '../types/index.js'

const INTERNAL_SERVER_ERR: HttpError = {
	status: 500,
	message: 'Something went wrong',
}

export { INTERNAL_SERVER_ERR }
