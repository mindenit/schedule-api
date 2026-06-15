import { Module, Provider } from '@nestjs/common'
import Redis from 'ioredis'

import { ConfigModule } from '../config/config.module'
import { CacheService } from './cache.service'
import { CACHE_CONNECTION_TOKEN } from './di-tokens'

const cacheConnectionProvider = {
	provide: CACHE_CONNECTION_TOKEN,
	useFactory: (cacheService: CacheService): Redis => cacheService.get(),
	inject: [CacheService],
} satisfies Provider

@Module({
	imports: [ConfigModule],
	providers: [CacheService, cacheConnectionProvider],
	exports: [cacheConnectionProvider],
})
export class CacheModule {}
