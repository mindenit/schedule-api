import type { CommonDependencies, Maybe } from '@/core/types/index.js'
import type { CistParser } from '@/core/types/parsers.js'
import type { CistGroupsOutput, CistGroupsRawJson } from '@/core/types/proxy.js'
import { fetchProxy, hashObject } from '@/core/utils/index.js'
import type { Direction, Faculty, Group, Speciality } from '@/db/types.js'

export class GroupsParserImpl implements CistParser<CistGroupsOutput> {
	private readonly endpoint: string
	private hashSet: Set<string>
	private groups: Group[]

	constructor({ config }: CommonDependencies) {
		const { baseUrl } = config.proxy

		this.endpoint = `${baseUrl}/lists/groups`
		this.hashSet = new Set()
		this.groups = []
	}

	async parse(): Promise<Maybe<CistGroupsOutput>> {
		const raw = await fetchProxy<CistGroupsRawJson>(this.endpoint)

		if (!Object.hasOwn(raw, 'university')) {
			return null
		}

		const faculties: Faculty[] = []
		const directions: Direction[] = []
		const specialities: Speciality[] = []

		if (!Object.hasOwn(raw.university, 'faculties')) {
			return null
		}

		for (const faculty of raw.university.faculties) {
			faculties.push({
				id: faculty.id,
				fullName: faculty.short_name,
				shortName: faculty.full_name,
			})

			if (!Object.hasOwn(faculty, 'directions')) {
				continue
			}

			for (const direction of faculty.directions) {
				directions.push({
					id: direction.id,
					fullName: direction.short_name,
					shortName: direction.full_name,
					facultyId: faculty.id,
				})

				if (!Object.hasOwn(direction, 'specialities')) {
					continue
				}

				for (const speciality of direction.specialities) {
					specialities.push({
						id: speciality.id,
						fullName: speciality.full_name,
						shortName: speciality.short_name,
						directionId: direction.id,
					})

					if (!Object.hasOwn(speciality, 'groups')) {
						continue
					}

					for (const group of speciality.groups) {
						this.addGroup({
							...group,
							specialityId: speciality.id,
							directionId: null,
						})
					}
				}

				if (!Object.hasOwn(direction, 'groups')) {
					continue
				}

				for (const group of direction.groups) {
					this.addGroup({
						...group,
						directionId: direction.id,
						specialityId: null,
					})
				}
			}
		}

		return { groups: this.groups, faculties, specialities, directions }
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
