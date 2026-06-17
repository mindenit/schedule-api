import { Injectable, Logger } from '@nestjs/common'
import { ConfigInvalidException } from 'src/common/exceptions/config.exception'
import { isRecord } from 'src/common/utils/type-checkers/type-checkers'

import { type Config, EnvSchema, toConfig } from './config.schema'

@Injectable()
export class ConfigService {
	private readonly logger: Logger = new Logger(ConfigService.name)
	private readonly config: Config

	constructor() {
		try {
			this.config = toConfig(EnvSchema.parse(process.env))
		} catch (error: unknown) {
			this.logger.error('config-service-config-error', {
				error: error instanceof Error ? error.message : String(error),
			})
			throw new ConfigInvalidException(isRecord(error) ? error : {})
		}
	}

	/*
	 * Gets a config value by key.
	 * @param {K} key - Key of the config value
	 * @returns {Config[K]} Config value
	 */
	get<K extends keyof Config>(key: K): Config[K] {
		return Reflect.get(this.config, key)
	}
}
