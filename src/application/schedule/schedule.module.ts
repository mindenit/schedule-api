import { Module } from '@nestjs/common'
import { CacheModule } from 'src/components/cache/cache.module'
import { ConfigModule } from 'src/components/config/config.module'
import { DatabaseModule } from 'src/components/database/database.module'
import { LoggerModule } from 'src/components/logger/logger.module'
import { SyncRunsModule } from 'src/components/sync-runs/sync-runs.module'
import { WebhooksModule } from 'src/components/webhooks/webhooks.module'
import { CistModule } from 'src/core/cist/cist.module'

import { PhantomSkipService } from './phantom-skip.service'
import { ScheduleService } from './schedule.service'

@Module({
	imports: [
		CacheModule,
		CistModule,
		ConfigModule,
		DatabaseModule,
		LoggerModule,
		SyncRunsModule,
		WebhooksModule,
	],
	providers: [ScheduleService, PhantomSkipService],
	exports: [ScheduleService],
})
export class ScheduleModule {}
