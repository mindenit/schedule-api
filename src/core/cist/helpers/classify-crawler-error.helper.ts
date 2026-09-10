import { CistCrawlerError } from '@mindenit/cist-crawler'
import {
	CistCrawlerErrorCodes,
	CistCrawlerException,
} from 'src/common/exceptions/cist-crawler.exception'

// A CistCrawlerError carries a `.code` (set only for classified Oracle
// exceptions, e.g. "ORA-20001") or a 400 status (malformed/unparseable
// response). Neither is fixed by retrying -- CIST returned *something*,
// it just wasn't usable. Anything else (no servers, network error, fetch
// aborted) is a genuine transient availability issue, worth retrying.
export const classifyCrawlerError = (
	e: unknown,
	fallbackMessage: string,
): CistCrawlerException => {
	if (e instanceof CistCrawlerError && (e.code || e.status === 400)) {
		return new CistCrawlerException(
			CistCrawlerErrorCodes.PARSE_FAILED,
			e.message,
		)
	}

	return new CistCrawlerException(
		CistCrawlerErrorCodes.FETCH_FAILED,
		e instanceof Error ? e.message : fallbackMessage,
	)
}
