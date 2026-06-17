import { Module } from '@nestjs/common'
import { CacheModule } from 'src/components/cache/cache.module'
import { DatabaseModule } from 'src/components/database/database.module'
import { LoggerModule } from 'src/components/logger/logger.module'
import { WebhooksModule } from 'src/components/webhooks/webhooks.module'
import { CistModule } from 'src/core/cist/cist.module'

import { ScheduleService } from './schedule.service'

@Module({
	imports: [
		CacheModule,
		CistModule,
		DatabaseModule,
		LoggerModule,
		WebhooksModule,
	],
	providers: [ScheduleService],
	exports: [ScheduleService],
})
export class ScheduleModule {}
