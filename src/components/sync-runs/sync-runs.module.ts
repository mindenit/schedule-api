import { Module } from '@nestjs/common'

import { DatabaseModule } from '../database/database.module'
import { SyncRunsService } from './sync-runs.service'

@Module({
	imports: [DatabaseModule],
	providers: [SyncRunsService],
	exports: [SyncRunsService],
})
export class SyncRunsModule {}
