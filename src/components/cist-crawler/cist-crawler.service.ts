import { Injectable } from '@nestjs/common'

import { ConfigService } from '../config/config.service'
import { LoggerService } from '../logger/logger.service'
import { MultiKeyCistCrawler } from './multi-key-cist-crawler'

@Injectable()
export class CistCrawlerService {
	private readonly _crawler: MultiKeyCistCrawler

	constructor(
		private readonly configService: ConfigService,
		logger: LoggerService,
	) {
		const { cist } = this.configService.get('integrations')

		this._crawler = new MultiKeyCistCrawler(cist.clientIds, logger)
	}

	/*
	 * Gets the Cist crawler instance.
	 * @returns {MultiKeyCistCrawler} The Cist crawler instance.
	 */
	get(): MultiKeyCistCrawler {
		return this._crawler
	}
}
