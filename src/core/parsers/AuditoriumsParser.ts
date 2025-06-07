import type { Auditorium } from '@/db/types.js'
import type { Maybe } from '../types/common.js'
import type { CommonDependencies } from '../types/deps.js'
import type { BaseParser } from '../types/parsers.js'
import type { CistAuditoriumsRawJson } from '../types/proxy.js'
import { fetchProxy, hashObject } from '../utils/index.js'

export class AuditoriumParser implements BaseParser<Auditorium> {
	private readonly endpoint: string

	constructor({ config }: CommonDependencies) {
		const { baseUrl } = config.proxy

		this.endpoint = `${baseUrl}/lists/auditories`
	}

	async parse(): Promise<Maybe<Auditorium[]>> {
		const raw = await fetchProxy<CistAuditoriumsRawJson>(this.endpoint)

		const auditoriums: Auditorium[] = []
		const hashMap = new Map<string, boolean>()

		if (!Object.hasOwn(raw, 'university')) {
			return null
		}

		if (!Object.hasOwn(raw.university, 'buildings')) {
			return null
		}

		for (const building of raw.university.buildings) {
			if (!Object.hasOwn(building, 'auditories')) {
				continue
			}

			for (const auditorium of building.auditories) {
				if (!auditorium.short_name.length) {
					continue
				}

				const hash = hashObject(auditorium)

				if (hashMap.has(hash)) {
					continue
				}

				auditoriums.push({
					id: Number.parseInt(auditorium.id),
					name: auditorium.short_name,
				})

				hashMap.set(hash, true)
			}
		}

		return auditoriums
	}
}
