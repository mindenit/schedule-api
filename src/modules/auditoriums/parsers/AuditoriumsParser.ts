import type { Auditorium, AuditoriumType, Building } from '@/db/types.js'
import type { Maybe } from '@/core/types/common.js'
import type { CommonDependencies } from '@/core/types/deps.js'
import type {
	CistAuditoriumsOutput,
	CistAuditoriumsRawJson,
} from '@/core/types/proxy.js'
import { fetchProxy, hashObject } from '@/core/utils/index.js'
import type { CistParser } from '@/core/types/cist.js'

export class AuditoriumsParserImpl
	implements CistParser<CistAuditoriumsOutput>
{
	private readonly endpoint: string

	constructor({ config }: CommonDependencies) {
		const { baseUrl } = config.proxy

		this.endpoint = `${baseUrl}/lists/auditories`
	}

	async parse(): Promise<Maybe<CistAuditoriumsOutput>> {
		const raw = await fetchProxy<CistAuditoriumsRawJson>(this.endpoint)

		const auditoriums: Auditorium[] = []
		const auditoriumTypes: AuditoriumType[] = []
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

				for (const type of auditorium.auditory_types) {
					auditoriumTypes.push({
						id: Number.parseInt(type.id),
						name: type.short_name,
						auditoriumId: Number.parseInt(auditorium.id),
					})
				}

				auditoriums.push({
					id: Number.parseInt(auditorium.id),
					name: auditorium.short_name,
					hasPower: Boolean(auditorium.is_have_power),
					floor:
						auditorium.floor === '' ? 0 : Number.parseInt(auditorium.floor),
					buildingId: building.id,
				})

				hashMap.set(hash, true)
			}

			buildings.push({
				id: building.id,
				fullName: building.full_name,
				shortName: building.short_name,
			})
		}

		return { buildings, auditoriums, auditoriumTypes }
	}
}
