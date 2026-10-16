import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ConfigService } from '../config/config.service'
import { LoggerService } from '../logger/logger.service'
import { CistHealthService } from './cist-health.service'
import { fingerprintKey } from './multi-key-cist-crawler'

const KEYS = ['Zq7-distinctive-SECRET-key0', 'Wx9-distinctive-SECRET-key1']
const [MAIN, BACKUP] = ['cist.nure.ua', 'cist2.nure.ua']
const VALID = '{"time-zone":"Europe/Kiev","events":[]}'
const REJECTED = 'ORA-20001: You are not authorized to use this API'

type Reply = { status?: number; body?: string } | 'hang' | 'network'
type Handler = (host: string, keyIndex: number) => Reply

describe('CistHealthService', () => {
	let logger: { log: ReturnType<typeof vi.fn> }
	let fetchMock: ReturnType<typeof vi.fn>

	const stubFetch = (handler: Handler) => {
		fetchMock = vi.fn((url: string, init: { signal: AbortSignal }) => {
			const { host, searchParams } = new URL(url)
			const reply = handler(host, KEYS.indexOf(searchParams.get('idClient')!))

			if (reply === 'network') {
				return Promise.reject(new TypeError('fetch failed'))
			}
			if (reply === 'hang') {
				return new Promise((_, reject) =>
					init.signal.addEventListener('abort', () =>
						reject(init.signal.reason as Error),
					),
				)
			}
			return Promise.resolve(
				new Response(reply.body ?? '', { status: reply.status ?? 200 }),
			)
		})
		vi.stubGlobal('fetch', fetchMock)
	}

	// Short timeouts keep hang cases fast; real values are the module constants.
	const build = (overrides: Record<string, number> = {}) => {
		const service = new CistHealthService(
			{
				get: () => ({ cist: { clientIds: KEYS } }),
			} as unknown as ConfigService,
			logger as unknown as LoggerService,
		)
		Object.assign(service, { probeTimeoutMs: 20, ...overrides })
		return service
	}

	beforeEach(() => {
		logger = { log: vi.fn() }
	})

	afterEach(() => {
		vi.unstubAllGlobals()
	})

	it('probes every server x key with an encoded key', async () => {
		stubFetch(() => ({ body: VALID }))

		const health = await build().check()

		expect(fetchMock).toHaveBeenCalledTimes(4)
		expect(fetchMock.mock.calls[0][0]).toBe(
			`https://${MAIN}/ias/app/tt/P_API_EVEN_JSON?type_id=1&timetable_id=1&time_from=946684800&time_to=946684801&idClient=${encodeURIComponent(KEYS[0])}`,
		)
		expect(health.ambiguous).toBe(false)
		expect(health.servers.map((s) => s.host)).toEqual([MAIN, BACKUP])
		for (const server of health.servers) {
			expect(server.up).toBe(true)
			expect(server.latencyMs).toEqual(expect.any(Number))
			expect(server.keys).toEqual([
				{ index: 1, status: 'valid' },
				{ index: 2, status: 'valid' },
			])
		}
	})

	it('reports a rejected key next to a valid one', async () => {
		stubFetch((_, i) => ({ body: i === 0 ? REJECTED : VALID }))

		const { servers, ambiguous } = await build().check()

		expect(servers[0].keys).toEqual([
			{ index: 1, status: 'rejected' },
			{ index: 2, status: 'valid' },
		])
		expect(ambiguous).toBe(false)
	})

	it('logs a redacted body sample for every non-valid probe', async () => {
		stubFetch((host, i) =>
			host === MAIN
				? { body: i === 0 ? VALID : `${REJECTED} ${KEYS[1]}` }
				: { status: 500, body: 'x'.repeat(100) },
		)

		await build().check()

		const bodies = logger.log.mock.calls.map(
			([, meta]) => (meta as { body?: string }).body,
		)
		// Probes log as they settle, so compare order-free.
		expect(bodies.toSorted()).toEqual(
			[undefined, `${REJECTED} ***`, 'x'.repeat(60), 'x'.repeat(60)].toSorted(),
		)
	})

	it('flags ambiguous when every key is rejected on every up server', async () => {
		stubFetch((host) => (host === MAIN ? 'network' : { body: REJECTED }))

		const { servers, ambiguous } = await build().check()

		expect(servers[0]).toEqual({
			host: MAIN,
			up: false,
			latencyMs: null,
			keys: [
				{ index: 1, status: 'unknown', reason: 'network' },
				{ index: 2, status: 'unknown', reason: 'network' },
			],
		})
		expect(servers[1].up).toBe(true)
		expect(ambiguous).toBe(true)
	})

	it('is not ambiguous when no server is up', async () => {
		stubFetch(() => 'network')

		expect((await build().check()).ambiguous).toBe(false)
	})

	it('maps timeouts, non-200, Oracle errors and garbage to unknown', async () => {
		stubFetch((host, i) => {
			if (host === MAIN) return i === 0 ? 'hang' : { status: 404, body: VALID }
			return { body: i === 0 ? 'ORA-04030: out of memory' : '<html>' }
		})

		const { servers } = await build().check()

		expect(servers.map((s) => [s.up, s.keys])).toEqual([
			[
				false,
				[
					{ index: 1, status: 'unknown', reason: 'timeout' },
					{ index: 2, status: 'unknown', reason: 'http 404' },
				],
			],
			[
				false,
				[
					{ index: 1, status: 'unknown', reason: 'ORA-04030' },
					{ index: 2, status: 'unknown', reason: 'unrecognised' },
				],
			],
		])
	})

	it('shares one in-flight check and caches the result', async () => {
		stubFetch(() => ({ body: VALID }))
		const service = build()

		const [a, b] = await Promise.all([service.check(), service.check()])
		const c = await service.check()

		expect(a).toBe(b)
		expect(c).toBe(a)
		expect(fetchMock).toHaveBeenCalledTimes(4)
	})

	it('does not cache a failed check', async () => {
		stubFetch(() => ({ body: VALID }))
		logger.log.mockImplementationOnce(() => {
			throw new Error('boom')
		})
		const service = build()

		await expect(service.check()).rejects.toThrow('boom')
		await expect(service.check()).resolves.toMatchObject({ ambiguous: false })
		expect(fetchMock).toHaveBeenCalledTimes(8)
	})

	it('never exposes key text or fingerprints in the result', async () => {
		stubFetch((host, i) =>
			host === MAIN
				? { body: i === 0 ? VALID : REJECTED }
				: { body: `echo idClient=${KEYS.at(i)}` },
		)

		const json = JSON.stringify(await build().check())
		const logged = JSON.stringify(logger.log.mock.calls)

		KEYS.forEach((key, i) => {
			const fingerprint = fingerprintKey(key, i)
			for (const secret of [key, encodeURIComponent(key), 'distinctive']) {
				expect(json).not.toContain(secret)
				expect(logged).not.toContain(secret)
			}
			expect(json).not.toContain(fingerprint.split(':')[1])
			expect(logged).toContain(fingerprint)
		})
	})
})
