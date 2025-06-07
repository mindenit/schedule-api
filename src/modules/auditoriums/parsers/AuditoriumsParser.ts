import type { Auditorium, Building } from '@/db/types.js'
import type { Maybe } from '@/core/types/common.js'
import type { CommonDependencies } from '@/core/types/deps.js'
import type { BaseParser } from '@/core/types/parsers.js'
import type {
	CistAuditoriumOutput,
	CistAuditoriumsRawJson,
} from '@/core/types/proxy.js'
import { fetchProxy, hashObject } from '@/core/utils/index.js'

export class AuditoriumParserImpl implements BaseParser<CistAuditoriumOutput> {
	private readonly endpoint: string

	constructor({ config }: CommonDependencies) {
		const { baseUrl } = config.proxy

		this.endpoint = `${baseUrl}/lists/auditories`
	}

	async parse(): Promise<Maybe<CistAuditoriumOutput>> {
		const raw = await fetchProxy<CistAuditoriumsRawJson>(this.endpoint)

		const auditoriums: Auditorium[] = []
		const buildings: Building[] = []

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

			buildings.push({
				id: building.id,
				fullName: building.full_name,
				shortName: building.short_name,
			})
		}

		return { buildings, auditoriums }
	}
}
