import CistCrawler, { CistCrawlerError } from '@mindenit/cist-crawler'
import { CistCrawlerErrorCodes } from 'src/common/exceptions/cist-crawler.exception'
import { classifyCrawlerError } from 'src/core/cist/helpers/classify-crawler-error.helper'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { LoggerService } from '../logger/logger.service'
import {
	AllCistKeysRejectedError,
	fingerprintKey,
	MultiKeyCistCrawler,
} from './multi-key-cist-crawler'

const KEYS = ['key-zero-SECRET', 'key-one-SECRET', 'key-two-SECRET']
const rejected = () =>
	new CistCrawlerError('Oracle exception (ORA-20001)', 502, 'ORA-20001')

describe('MultiKeyCistCrawler', () => {
	let fakes: Map<string, ReturnType<typeof vi.fn>>
	let logger: { log: ReturnType<typeof vi.fn>; warn: ReturnType<typeof vi.fn> }

	const build = (keys: string[]) =>
		new MultiKeyCistCrawler(
			keys,
			logger as unknown as LoggerService,
			(clientId) => {
				const getSchedule = vi.fn().mockResolvedValue({ key: clientId })
				fakes.set(clientId, getSchedule)
				return { getSchedule } as unknown as CistCrawler
			},
		)
	const fake = (key: string) => fakes.get(key)!

	beforeEach(() => {
		fakes = new Map()
		logger = { log: vi.fn(), warn: vi.fn() }
	})

	it('uses the single key and passes arguments through', async () => {
		const crawler = build(KEYS.slice(0, 1))
		const from = new Date(1)

		await expect(crawler.getSchedule(1, 42, from)).resolves.toEqual({
			key: KEYS[0],
		})
		expect(fake(KEYS[0])).toHaveBeenCalledWith(1, 42, from, undefined)
		expect(crawler.getStats()).toEqual({
			keySwitches: 0,
			rejections: 0,
			activeKey: fingerprintKey(KEYS[0], 0),
			keyCount: 1,
		})
	})

	it('is a CistCrawler so parsers keep their DI type', () => {
		expect(build(KEYS)).toBeInstanceOf(CistCrawler)
	})

	it('falls back on ORA-20001 and sticks to the working key', async () => {
		const crawler = build(KEYS)
		fake(KEYS[0]).mockRejectedValue(rejected())

		await expect(crawler.getSchedule(1, 1)).resolves.toEqual({ key: KEYS[1] })
		await expect(crawler.getSchedule(1, 2)).resolves.toEqual({ key: KEYS[1] })

		expect(fake(KEYS[0])).toHaveBeenCalledTimes(1)
		expect(fake(KEYS[1])).toHaveBeenCalledTimes(2)
		expect(crawler.getStats()).toMatchObject({
			keySwitches: 1,
			rejections: 1,
			activeKey: fingerprintKey(KEYS[1], 1),
		})
		expect(logger.log).toHaveBeenCalledWith('cist-keys|switched', {
			from: fingerprintKey(KEYS[0], 0),
			to: fingerprintKey(KEYS[1], 1),
		})
	})

	it('wraps around from the active key', async () => {
		const crawler = build(KEYS)
		fake(KEYS[0]).mockRejectedValueOnce(rejected())
		fake(KEYS[1]).mockRejectedValueOnce(rejected())
		await crawler.getSchedule(1, 1) // active -> key 2

		fake(KEYS[2]).mockRejectedValueOnce(rejected())
		await expect(crawler.getSchedule(1, 2)).resolves.toEqual({ key: KEYS[0] })
		expect(crawler.getStats().activeKey).toBe(fingerprintKey(KEYS[0], 0))
	})

	it('rethrows other errors unchanged without trying other keys', async () => {
		const crawler = build(KEYS)
		const err = new CistCrawlerError('No available servers', 503)
		fake(KEYS[0]).mockRejectedValue(err)

		await expect(crawler.getSchedule(1, 1)).rejects.toBe(err)
		expect(fake(KEYS[1])).not.toHaveBeenCalled()
	})

	it('propagates a non-rejection error from a fallback key', async () => {
		const crawler = build(KEYS)
		const err = new CistCrawlerError('Oracle', 502, 'ORA-04030')
		fake(KEYS[0]).mockRejectedValue(rejected())
		fake(KEYS[1]).mockRejectedValue(err)

		await expect(crawler.getSchedule(1, 1)).rejects.toMatchObject({
			code: 'ORA-04030',
			status: 502,
		})
		expect(fake(KEYS[2])).not.toHaveBeenCalled()
		expect(crawler.getStats().activeKey).toBe(fingerprintKey(KEYS[0], 0))
	})

	it('throws a deferrable error once every key was tried once', async () => {
		const crawler = build(KEYS)
		for (const key of KEYS) fake(key).mockRejectedValue(rejected())

		const err = await crawler.getSchedule(1, 1).catch((e: unknown) => e)

		expect(err).toBeInstanceOf(AllCistKeysRejectedError)
		for (const key of KEYS) expect(fake(key)).toHaveBeenCalledTimes(1)
		expect(crawler.getStats()).toMatchObject({
			keySwitches: 0,
			rejections: 3,
			activeKey: fingerprintKey(KEYS[0], 0),
		})

		const classified = classifyCrawlerError(err, 'f')
		expect(classified.code).toBe(CistCrawlerErrorCodes.FETCH_FAILED)
		expect(classified.message).toBe('all 3 CIST keys rejected (ORA-20001)')
		const logged = JSON.stringify([
			logger.log.mock.calls,
			logger.warn.mock.calls,
		])
		for (const key of KEYS) {
			expect(classified.message).not.toContain(key)
			expect(logged).not.toContain(key)
		}
	})

	it('treats a rejected single key as all keys rejected', async () => {
		const crawler = build(KEYS.slice(0, 1))
		fake(KEYS[0]).mockRejectedValue(rejected())

		await expect(crawler.getSchedule(1, 1)).rejects.toBeInstanceOf(
			AllCistKeysRejectedError,
		)
		expect(fake(KEYS[0])).toHaveBeenCalledTimes(1)
	})

	it('resetStats clears counters but keeps the active key', async () => {
		const crawler = build(KEYS)
		fake(KEYS[0]).mockRejectedValue(rejected())
		await crawler.getSchedule(1, 1)

		crawler.resetStats()

		expect(crawler.getStats()).toEqual({
			keySwitches: 0,
			rejections: 0,
			activeKey: fingerprintKey(KEYS[1], 1),
			keyCount: 3,
		})
	})
})
