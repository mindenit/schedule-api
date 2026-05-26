import { Module } from '@nestjs/common'
import { ScheduleService } from './schedule.service'
import { CistModule } from 'src/core/cist/cist.module'
import { DatabaseModule } from 'src/components/database/database.module'
import { CacheModule } from 'src/components/cache/cache.module'
import { WebhooksModule } from 'src/components/webhooks/webhooks.module'

@Module({
	imports: [CacheModule, CistModule, DatabaseModule, WebhooksModule],
	providers: [ScheduleService],
	exports: [ScheduleService],
})
export class ScheduleModule {}
