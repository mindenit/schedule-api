import { Module, Provider } from '@nestjs/common'
import { CistCrawlerService } from './cist-crawler.service'
import { CIST_CRAWLER_TOKEN } from './di-tokens'

const cistCrawlerProvider = {
	provide: CIST_CRAWLER_TOKEN,
	useFactory: (cistCrawlerService: CistCrawlerService) =>
		cistCrawlerService.get(),
	inject: [CistCrawlerService],
} satisfies Provider

@Module({
	providers: [cistCrawlerProvider],
	exports: [cistCrawlerProvider],
})
export class CistCrawlerModule {}
