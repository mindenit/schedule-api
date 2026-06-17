import { Module } from '@nestjs/common'

import { CacheModule } from '../cache/cache.module'
import { HealthController } from './health.controller'
import { HealthService } from './health.service'

@Module({
	imports: [CacheModule],
	providers: [HealthService],
	controllers: [HealthController],
})
export class HealthModule {}
