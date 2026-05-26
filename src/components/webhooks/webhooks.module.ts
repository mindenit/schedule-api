import { Module } from '@nestjs/common'
import { ConfigModule } from '../config/config.module'
import { WebhooksService } from './webhooks.service'

@Module({
	imports: [ConfigModule],
	providers: [WebhooksService],
	exports: [WebhooksService],
})
export class WebhooksModule {}
