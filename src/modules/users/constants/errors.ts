import type { HttpError } from '@/core/types/common.js'

const USER_ALREADY_EXISTS_ERR: HttpError = {
	status: 400,
	message: 'User with such name already exists',
}

export { USER_ALREADY_EXISTS_ERR }
