import type { Group } from '@/db/types.js'
import type { Maybe } from '../types/common.js'
import type { CommonDependencies } from '../types/deps.js'
import type { BaseParser } from '../types/parsers.js'
import type { CistGroupsRawJson } from '../types/proxy.js'
import { fetchProxy, hashObject } from '../utils/index.js'

export class GroupParser implements BaseParser<Group> {
	private readonly endpoint: string
	private hashSet: Set<string>
	private groups: Group[]

	constructor({ config }: CommonDependencies) {
		const { baseUrl } = config.proxy

		this.endpoint = `${baseUrl}/lists/groups`
		this.hashSet = new Set()
		this.groups = []
	}

	async parse(): Promise<Maybe<Group[]>> {
		const raw = await fetchProxy<CistGroupsRawJson>(this.endpoint)

		if (!Object.hasOwn(raw, 'university')) {
			return null
		}

		if (!Object.hasOwn(raw.university, 'faculties')) {
			return null
		}

		for (const faculty of raw.university.faculties) {
			if (!Object.hasOwn(faculty, 'directions')) {
				continue
			}

			for (const direction of faculty.directions) {
				if (!Object.hasOwn(direction, 'specialities')) {
					continue
				}

				for (const speciality of direction.specialities) {
					if (!Object.hasOwn(speciality, 'groups')) {
						continue
					}

					for (const group of speciality.groups) {
						this.addGroup(group)
					}
				}

				if (!Object.hasOwn(direction, 'groups')) {
					continue
				}

				for (const group of direction.groups) {
					this.addGroup(group)
				}
			}
		}

		return this.groups
	}

	private addGroup(group: Group): void {
		if (!group.name?.length) {
			return
		}

		const hash = hashObject(group)

		if (this.hashSet.has(hash)) {
			return
		}

		this.groups.push(group)

		this.hashSet.add(hash)
	}
}
