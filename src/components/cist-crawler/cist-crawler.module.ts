import { Module, Provider } from '@nestjs/common'
import { ConfigModule } from '../config/config.module'
import { CistCrawlerService } from './cist-crawler.service'
import { CIST_CRAWLER_TOKEN } from './di-tokens'

const cistCrawlerProvider = {
	provide: CIST_CRAWLER_TOKEN,
	useFactory: (cistCrawlerService: CistCrawlerService) =>
		cistCrawlerService.get(),
	inject: [CistCrawlerService],
} satisfies Provider

@Module({
	imports: [ConfigModule],
	providers: [CistCrawlerService, cistCrawlerProvider],
	exports: [cistCrawlerProvider],
})
export class CistCrawlerModule {}
