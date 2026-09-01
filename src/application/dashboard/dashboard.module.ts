import { Module } from '@nestjs/common'
import { DashKeyGuard } from 'src/common/guards/dash-key.guard'
import { CacheModule } from 'src/components/cache/cache.module'
import { ConfigModule } from 'src/components/config/config.module'
import { DatabaseModule } from 'src/components/database/database.module'
import { SyncRunsModule } from 'src/components/sync-runs/sync-runs.module'

import { DashboardController } from './dashboard.controller'
import { DashboardService } from './dashboard.service'

@Module({
	imports: [CacheModule, ConfigModule, DatabaseModule, SyncRunsModule],
	controllers: [DashboardController],
	providers: [DashboardService, DashKeyGuard],
})
export class DashboardModule {}
