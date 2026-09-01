import { Module } from '@nestjs/common'
import { CacheModule } from 'src/components/cache/cache.module'
import { DatabaseModule } from 'src/components/database/database.module'
import { SyncRunsModule } from 'src/components/sync-runs/sync-runs.module'

import { DashboardController } from './dashboard.controller'
import { DashboardService } from './dashboard.service'

@Module({
	imports: [CacheModule, DatabaseModule, SyncRunsModule],
	controllers: [DashboardController],
	providers: [DashboardService],
})
export class DashboardModule {}
