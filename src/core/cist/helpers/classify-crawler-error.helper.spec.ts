import { CistCrawlerError } from '@mindenit/cist-crawler'
import { CistCrawlerErrorCodes } from 'src/common/exceptions/cist-crawler.exception'
import { describe, expect, it } from 'vitest'

import {
	classifyCrawlerError,
	TRANSIENT_ORA_CODES,
} from './classify-crawler-error.helper'

const URL =
	'https://cist.nure.ua/ias/app/tt/P_API_EVEN_JSON?type_id=1&timetable_id=1&time_from=1&time_to=2'

describe('classifyCrawlerError', () => {
	it('redacts idClient from fetch error messages', () => {
		const e = new CistCrawlerError(
			`Failed to fetch data from ${URL}&idClient=s3cr3t-KEY: fetch failed`,
			500,
		)

		const { message, code } = classifyCrawlerError(e, 'fallback')

		expect(code).toBe(CistCrawlerErrorCodes.FETCH_FAILED)
		expect(message).toBe(
			`Failed to fetch data from ${URL}&idClient=***: fetch failed`,
		)
	})

	it.each([
		['idClient=abc%2Fdef&x=1', 'idClient=***&x=1'],
		['idClient= abc def', 'idClient= *** def'],
		['idclient%3Dabc"', 'idclient%3D***"'],
		['a idClient=k1 b idClient=k2', 'a idClient=*** b idClient=***'],
	])('redacts %s', (input, expected) => {
		expect(classifyCrawlerError(new Error(input), 'fallback').message).toBe(
			expected,
		)
	})

	it('maps non-transient Oracle and parse errors to PARSE_FAILED', () => {
		const oracle = new CistCrawlerError('ORA', 502, 'ORA-20001')
		const parse = new CistCrawlerError('bad json', 400)

		expect(classifyCrawlerError(oracle, 'f').code).toBe(
			CistCrawlerErrorCodes.PARSE_FAILED,
		)
		expect(classifyCrawlerError(parse, 'f').code).toBe(
			CistCrawlerErrorCodes.PARSE_FAILED,
		)
	})

	it.each(TRANSIENT_ORA_CODES)('maps transient %s to FETCH_FAILED', (code) => {
		const text = `Cist returned an Oracle exception for 'schedule_1_1': x (${code})`

		const result = classifyCrawlerError(
			new CistCrawlerError(text, 502, code),
			'f',
		)

		expect(result.code).toBe(CistCrawlerErrorCodes.FETCH_FAILED)
		expect(result.message).toBe(text)
	})

	it('maps other errors to FETCH_FAILED with fallback for non-Error', () => {
		const noServers = classifyCrawlerError(
			new CistCrawlerError('No available servers', 503),
			'f',
		)
		const unknown = classifyCrawlerError('boom', 'Failed to fetch groups')

		expect(noServers.code).toBe(CistCrawlerErrorCodes.FETCH_FAILED)
		expect(noServers.message).toBe('No available servers')
		expect(unknown.code).toBe(CistCrawlerErrorCodes.FETCH_FAILED)
		expect(unknown.message).toBe('Failed to fetch groups')
	})
})
