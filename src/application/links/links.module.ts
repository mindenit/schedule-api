import { Module } from '@nestjs/common'
import { CacheModule } from 'src/components/cache/cache.module'
import { LoggerModule } from 'src/components/logger/logger.module'

import { LinksController } from './links.controller'
import { LinksRepository } from './links.repository'

@Module({
	imports: [CacheModule, LoggerModule],
	providers: [LinksRepository],
	controllers: [LinksController],
})
export class LinksModule {}
