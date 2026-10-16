import { Module } from '@nestjs/common'
import { DashKeyGuard } from 'src/common/guards/dash-key.guard'
import { CacheModule } from 'src/components/cache/cache.module'
import { CistCrawlerModule } from 'src/components/cist-crawler/cist-crawler.module'
import { ConfigModule } from 'src/components/config/config.module'
import { DatabaseModule } from 'src/components/database/database.module'
import { SyncRunsModule } from 'src/components/sync-runs/sync-runs.module'

import { ScheduleModule } from '../schedule/schedule.module'
import { DashboardController } from './dashboard.controller'
import { DashboardService } from './dashboard.service'

@Module({
	imports: [
		CacheModule,
		CistCrawlerModule,
		ConfigModule,
		DatabaseModule,
		SyncRunsModule,
		ScheduleModule,
	],
	controllers: [DashboardController],
	providers: [DashboardService, DashKeyGuard],
})
export class DashboardModule {}
