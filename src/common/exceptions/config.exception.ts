import { HttpStatus } from '@nestjs/common'
import { AppException } from './app.exception'
import { CommonErrorCodes } from './error-codes'

class ConfigInvalidException extends AppException {
	constructor(details: Record<string, unknown>) {
		super(
			CommonErrorCodes.CONFIG_INVALID,
			'Config is invalid',
			HttpStatus.INTERNAL_SERVER_ERROR,
			details,
		)
	}
}

class ConfigNotFoundException extends AppException {
	constructor(configKey: string) {
		super(
			CommonErrorCodes.CONFIG_INVALID,
			`Config not found: ${configKey}`,
			HttpStatus.INTERNAL_SERVER_ERROR,
		)
	}
}

export { ConfigInvalidException, ConfigNotFoundException }
