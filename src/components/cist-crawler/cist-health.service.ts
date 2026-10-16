import { DEFAULT_CONFIG } from '@mindenit/cist-crawler'
import { Injectable } from '@nestjs/common'

import { ConfigService } from '../config/config.service'
import { LoggerService } from '../logger/logger.service'
import type { CistHealth } from './cist-health.schema'
import { fingerprintKey, KEY_REJECTED_CODE } from './multi-key-cist-crawler'
import { redactClientId } from './redact-client-id.helper'

// Constants
const LOG_PREFIX = 'cist-health'
export const CIST_HEALTH_PROBE_TIMEOUT_MS = 5_000
export const CIST_HEALTH_CACHE_TTL_MS = 10_000
const LOGGED_BODY_CHARS = 60
// 1-second window of a known group: ~2KB response, but still needs a key.
const PROBE_PATH =
	'/ias/app/tt/P_API_EVEN_JSON?type_id=1&timetable_id=1&time_from=946684800&time_to=946684801&idClient='

type Verdict = 'valid' | 'rejected' | 'cist-error' | 'unknown'

interface Probe {
	host: string
	keyIndex: number
	verdict: Verdict
	// Fixed vocabulary only: 'timeout' | 'network' | 'http N' | 'ORA-NNNNN' | 'unrecognised'
	reason?: string
	ms: number
}

const classifyProbe = (
	status: number,
	body: string,
): Pick<Probe, 'verdict' | 'reason'> => {
	if (status !== 200) return { verdict: 'unknown', reason: `http ${status}` }
	if (body.startsWith('{') && body.includes('"time-zone"')) {
		return { verdict: 'valid' }
	}
	if (body.startsWith(KEY_REJECTED_CODE)) return { verdict: 'rejected' }

	const ora = /ORA-\d{5}/.exec(body)
	return ora
		? { verdict: 'cist-error', reason: ora[0] }
		: { verdict: 'unknown', reason: 'unrecognised' }
}

// A 200 with a recognised body proves the server answers, even if it rejects the key.
const provesUp = (p: Pick<Probe, 'verdict'>) =>
	p.verdict === 'valid' || p.verdict === 'rejected'

/*
 * Probes every (CIST server x configured key) pair without touching the
 * crawler's key state. Output never contains key text or anything derived
 * from it; fingerprints go to server logs only.
 */
@Injectable()
export class CistHealthService {
	private readonly servers: readonly string[] = DEFAULT_CONFIG.servers
	private readonly keys: readonly string[]
	private readonly probeTimeoutMs = CIST_HEALTH_PROBE_TIMEOUT_MS
	private inFlight: Promise<CistHealth> | null = null
	private cached: { at: number; value: CistHealth } | null = null

	constructor(
		configService: ConfigService,
		private readonly logger: LoggerService,
	) {
		this.keys = configService.get('integrations').cist.clientIds
	}

	check(): Promise<CistHealth> {
		if (this.cached && Date.now() - this.cached.at < CIST_HEALTH_CACHE_TTL_MS) {
			return Promise.resolve(this.cached.value)
		}

		this.inFlight ??= this.run().finally(() => {
			this.inFlight = null
		})
		return this.inFlight
	}

	// Each probe is bounded by its own timeout (incl. body read), so this can't hang.
	private async run(): Promise<CistHealth> {
		const health = this.toHealth(
			await Promise.all(
				this.servers.flatMap((host) =>
					this.keys.map((key, i) => this.probe(host, key, i)),
				),
			),
		)
		this.cached = { at: Date.now(), value: health }
		return health
	}

	private async probe(host: string, key: string, keyIndex: number) {
		const startedAt = Date.now()
		let httpStatus: number | null = null
		let body = ''
		let result: Pick<Probe, 'verdict' | 'reason'>

		try {
			// The signal also bounds the body read below.
			const res = await fetch(
				`https://${host}${PROBE_PATH}${encodeURIComponent(key)}`,
				{ signal: AbortSignal.timeout(this.probeTimeoutMs) },
			)
			httpStatus = res.status
			// Only ASCII prefixes are inspected, so a lossless 8-bit decode is enough.
			body = new TextDecoder('latin1')
				.decode(await res.arrayBuffer())
				.replace(/^[^\x20-\x7e]+/, '')
				.trimStart()
			result = classifyProbe(res.status, body)
		} catch (e: unknown) {
			result = {
				verdict: 'unknown',
				reason:
					e instanceof Error && e.name === 'TimeoutError'
						? 'timeout'
						: 'network',
			}
		}

		const ms = Date.now() - startedAt
		this.logger.log(`${LOG_PREFIX}|probe`, {
			key: fingerprintKey(key, keyIndex),
			host,
			httpStatus,
			bytes: body.length,
			ms,
			verdict: result.verdict,
			...(!provesUp(result) && {
				reason: result.reason,
				body: redactClientId(body.slice(0, LOGGED_BODY_CHARS)),
			}),
		})

		return { host, keyIndex, ms, ...result } satisfies Probe
	}

	private toHealth(probes: Probe[]): CistHealth {
		const servers = this.servers.map((host): CistHealth['servers'][number] => {
			const own = probes.filter((p) => p.host === host)
			const upProbes = own.filter(provesUp)

			return {
				host,
				up: upProbes.length > 0,
				// Fastest recognised answer: server round trip, not the slowest key.
				latencyMs: upProbes.length
					? Math.min(...upProbes.map((p) => p.ms))
					: null,
				keys: own.map((p) => ({
					index: p.keyIndex + 1,
					status: p.verdict === 'cist-error' ? 'unknown' : p.verdict,
					...(p.reason && { reason: p.reason }),
				})),
			}
		})
		const upServers = servers.filter((s) => s.up)

		return {
			checkedAt: new Date().toISOString(),
			servers,
			// Every key refused everywhere CIST answers: revoked keys or a CIST-side auth fault.
			ambiguous:
				upServers.length > 0 &&
				upServers.every((s) => s.keys.every((k) => k.status === 'rejected')),
		}
	}
}
