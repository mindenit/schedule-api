import { Module, Provider } from '@nestjs/common'
import { CACHE_CONNECTION_TOKEN } from './di-tokens'
import { CacheService } from './cache.service'
import Redis from 'ioredis'
import { ConfigModule } from '../config/config.module'

const cacheConnectionProvider = {
	provide: CACHE_CONNECTION_TOKEN,
	useFactory: (cacheService: CacheService): Redis => cacheService.cache,
	inject: [CacheService],
} satisfies Provider

@Module({
	imports: [ConfigModule],
	providers: [CacheService, cacheConnectionProvider],
	exports: [cacheConnectionProvider],
})
export class CacheModule {}
