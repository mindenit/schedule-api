import { Module } from '@nestjs/common'
import { HealthController } from './health.controller'
import { HealthService } from './health.service'
import { CacheModule } from '../cache/cache.module'

@Module({
	imports: [CacheModule],
	providers: [HealthService],
	controllers: [HealthController],
})
export class HealthModule {}
