import { Injectable, Logger } from '@nestjs/common'
import { existsSync, globSync, readFileSync } from 'node:fs'
import { basename, resolve } from 'node:path'
import { type Config, ConfigSchema } from './config.schema'
import { ConfigInvalidException } from 'src/common/exceptions/config.exception'
import { isRecord } from 'src/common/utils/type-checkers/type-checkers'

const CONFIG_PATH = resolve('./configs')

/*
  Reads a JSON file and returns the parsed object.
  @param {string} filePath - Path to the JSON file to read
  @returns {Record<string, unknown>} Parsed JSON object
*/
const readJson = (filePath: string): Record<string, unknown> => {
	const content = readFileSync(filePath, 'utf-8')
	const parsed = JSON.parse(content)

	if (!isRecord(parsed)) {
		throw {}
	}

	return parsed
}

/*
  Gets the config key from a file name.
  @param {string} fileName - Name of the file
  @returns {string} Config key
*/
const getConfigKey = (fileName: string): string => {
	return basename(fileName)
		.replace('.default.json', '')
		.replace('.config.json', '')
}

@Injectable()
export class ConfigService {
	private readonly logger: Logger = new Logger(ConfigService.name)
	private config: Config

	constructor() {
		try {
			this.config = this.loadConfigs()
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
		return this.config[key]
	}

	/*
	 * Loads config files by pattern and returns a merged result.
	 * @returns {Config} Merged config values
	 */
	private loadConfigs(): Config {
		const defaults = this.loadFilesByPattern('*.default.json')
		const overrides = this.loadFilesByPattern('*.config.json')

		const merged = { ...defaults }

		for (const [key, value] of Object.entries(overrides)) {
			merged[key] =
				typeof merged[key] === 'object' && typeof value === 'object'
					? { ...merged[key], ...value }
					: value
		}

		return ConfigSchema.parse(merged)
	}

	/*
	 * Loads config files by pattern and returns a merged result.
	 * @param {string} pattern - Glob pattern for config files
	 * @returns {Record<string, Record<string, unknown>>} Merged config values
	 */
	private loadFilesByPattern(
		pattern: string,
	): Record<string, Record<string, unknown>> {
		const result: Record<string, Record<string, unknown>> = {}

		if (!existsSync(CONFIG_PATH)) {
			this.logger.warn(`Config directory not found: ${CONFIG_PATH}`)
			return result
		}

		const files = globSync(resolve(CONFIG_PATH, pattern))

		for (const file of files) {
			const key = getConfigKey(file)

			result[key] = readJson(file)
			this.logger.debug(`Loaded config: ${basename(file)} -> "${key}"`)
		}

		return result
	}
}
