import { HttpStatus } from '@nestjs/common'
import { AppException } from './app.exception'

export const CistCrawlerErrorCodes = {
	FETCH_FAILED: 'CIST_CRAWLER_FETCH_FAILED',
	PARSE_FAILED: 'CIST_CRAWLER_PARSE_FAILED',
} as const

type CistCrawlerErrorCode =
	(typeof CistCrawlerErrorCodes)[keyof typeof CistCrawlerErrorCodes]

export class CistCrawlerException extends AppException<CistCrawlerErrorCode> {
	constructor(
		code: CistCrawlerErrorCode,
		message: string,
		details?: Record<string, unknown>,
	) {
		super(code, message, HttpStatus.BAD_GATEWAY, details)
	}
}
