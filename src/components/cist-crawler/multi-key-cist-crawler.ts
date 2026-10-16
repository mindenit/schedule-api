import { createHash } from 'node:crypto'

import CistCrawler, {
	CistCrawlerError,
	type Response as CistResponse,
} from '@mindenit/cist-crawler'

import { LoggerService } from '../logger/logger.service'

const LOG_PREFIX = 'cist-keys'
export const KEY_REJECTED_CODE = 'ORA-20001'

// Server logs only: keys (and anything derived from them) stay out of HTTP
// responses and the DB. `index` is 0-based; the label is 1-based like the health route.
export const fingerprintKey = (key: string, index: number): string =>
	`k${index + 1}:${createHash('sha256').update(key).digest('hex').slice(0, 8)}`

// No `.code` + 5xx status: classifyCrawlerError maps it to FETCH_FAILED, so the
// group is deferred and retried (CIST auth glitches pass within minutes).
export class AllCistKeysRejectedError extends CistCrawlerError {
	constructor(count: number) {
		super(`all ${count} CIST keys rejected (${KEY_REJECTED_CODE})`, 503)
	}
}

export interface CistKeyStats {
	keySwitches: number
	rejections: number
	// 1-based position in CIST_CLIENT_ID
	activeKeyIndex: number
	keyCount: number
}

type CreateCrawler = (clientId: string) => CistCrawler

/*
 * CistCrawler that falls back to the next configured key when CIST rejects
 * the current one (ORA-20001). Keyless methods are inherited from the base
 * instance; each key gets its own crawler since the lib binds the key at
 * construction.
 */
export class MultiKeyCistCrawler extends CistCrawler {
	private readonly keys: readonly string[]
	private readonly crawlers: CistCrawler[]
	private readonly fingerprints: string[]
	private activeIndex = 0
	private keySwitches = 0
	private rejections = 0

	constructor(
		keys: readonly string[],
		private readonly logger: LoggerService,
		createCrawler: CreateCrawler = (clientId) => new CistCrawler({ clientId }),
	) {
		super({ clientId: keys[0] })
		this.keys = keys
		this.crawlers = keys.map((key) => createCrawler(key))
		this.fingerprints = keys.map((key, i) => fingerprintKey(key, i))
	}

	override async getSchedule(
		type: 1 | 2,
		id: number,
		timeFrom?: Date,
		timeTo?: Date,
	): Promise<CistResponse> {
		const start = this.activeIndex

		for (let n = 0; n < this.crawlers.length; n++) {
			const i = (start + n) % this.crawlers.length

			try {
				const response = await this.crawlers
					.at(i)!
					.getSchedule(type, id, timeFrom, timeTo)

				if (i !== this.activeIndex) {
					this.logger.log(`${LOG_PREFIX}|switched`, {
						from: this.fingerprints.at(this.activeIndex),
						to: this.fingerprints.at(i),
					})
					this.activeIndex = i
					this.keySwitches++
				}

				return response
			} catch (e: unknown) {
				if (!(e instanceof CistCrawlerError)) throw e
				if (e.code !== KEY_REJECTED_CODE) throw this.maskKeys(e)

				this.rejections++
				this.logger.warn(`${LOG_PREFIX}|rejected`, {
					key: this.fingerprints.at(i),
					entityId: id,
				})
			}
		}

		this.logger.warn(`${LOG_PREFIX}|all-rejected`, {
			tried: this.fingerprints,
		})
		throw new AllCistKeysRejectedError(this.crawlers.length)
	}

	// Exact-match backstop for redactClientId's regex. A fresh error drops the
	// original stack, whose first line repeats the unmasked message.
	private maskKeys(e: CistCrawlerError): CistCrawlerError {
		const message = this.keys
			.flatMap((key) => [key, encodeURIComponent(key)])
			// Longest first, so a key that contains another is masked whole.
			.toSorted((a, b) => b.length - a.length)
			.reduce((m, key) => m.replaceAll(key, '***'), e.message)
		return new CistCrawlerError(message, e.status, e.code)
	}

	getStats(): CistKeyStats {
		return {
			keySwitches: this.keySwitches,
			rejections: this.rejections,
			activeKeyIndex: this.activeIndex + 1,
			keyCount: this.crawlers.length,
		}
	}

	resetStats(): void {
		this.keySwitches = 0
		this.rejections = 0
	}
}
