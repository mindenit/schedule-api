import CistCrawler from '@mindenit/cist-crawler'
import { Injectable } from '@nestjs/common'
import { ConfigNotFoundException } from 'src/common/exceptions/config.exception'
import { ConfigService } from '../config/config.service'

@Injectable()
export class CistCrawlerService {
	private readonly _crawler: CistCrawler

	constructor(private readonly configService: ConfigService) {
		const integrationsConfig = this.configService.get('integrations')
		if (!('cist' in integrationsConfig)) {
			throw new ConfigNotFoundException(
				'Cist integration configuration not found',
			)
		}

		const cistConfig = integrationsConfig?.cist
		if (!cistConfig) {
			throw new ConfigNotFoundException(
				'Cist integration configuration not found',
			)
		}

		if (
			typeof cistConfig !== 'object' ||
			!('clientId' in cistConfig) ||
			typeof cistConfig.clientId !== 'string'
		) {
			throw new ConfigNotFoundException(
				'Cist integration configuration not found',
			)
		}

		this._crawler = new CistCrawler({ clientId: cistConfig.clientId })
	}

	/*
	 * Gets the Cist crawler instance.
	 * @returns {CistCrawler} The Cist crawler instance.
	 */
	get(): CistCrawler {
		return this._crawler
	}
}
