import { Injectable, Logger } from '@nestjs/common'

import { ConfigService } from '../config/config.service'

@Injectable()
export class WebhooksService {
	private readonly logger = new Logger(WebhooksService.name)
	private readonly enabled: boolean
	private readonly webhookUrl: string

	constructor(private readonly configService: ConfigService) {
		const { enabled, webhookUrl } = this.configService.get('webhooks')
		this.enabled = enabled
		this.webhookUrl = webhookUrl
	}

	async ping(message: string): Promise<void> {
		if (!this.enabled) {
			return
		}

		try {
			await fetch(this.webhookUrl, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ content: message }),
			})
		} catch (error: unknown) {
			this.logger.error('webhooks-ping-error', {
				error: error instanceof Error ? error.message : String(error),
			})
		}
	}
}
