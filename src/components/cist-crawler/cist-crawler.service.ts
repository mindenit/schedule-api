import CistCrawler from '@mindenit/cist-crawler'
import { Injectable } from '@nestjs/common'

import { ConfigService } from '../config/config.service'

@Injectable()
export class CistCrawlerService {
	private readonly _crawler: CistCrawler

	constructor(private readonly configService: ConfigService) {
		const { cist } = this.configService.get('integrations')

		this._crawler = new CistCrawler({ clientId: cist.clientId })
	}

	/*
	 * Gets the Cist crawler instance.
	 * @returns {CistCrawler} The Cist crawler instance.
	 */
	get(): CistCrawler {
		return this._crawler
	}
}
