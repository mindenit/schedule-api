import { RedisKeyBuilder } from '@/core/builders/RedisKeyBulder.js'
import type { DatabaseClient } from '@/core/types/deps.js'
import type { CistGroupsOutput } from '@/core/types/proxy.js'
import type { CistService } from '@/core/types/services.js'
import { academicGroupTable } from '@/db/schema/academic-group.js'
import { directionTable } from '@/db/schema/direction.js'
import { facultyTable } from '@/db/schema/faculty.js'
import { specialityTable } from '@/db/schema/speciality.js'
import type { Redis } from 'ioredis'
import type { GroupsInjectableDependencies } from '../types/index.js'

export class GroupsService implements CistService<CistGroupsOutput> {
	private readonly db: DatabaseClient
	private readonly cache: Redis

	constructor({ db, cache }: GroupsInjectableDependencies) {
		this.db = db.client
		this.cache = cache
	}

	async processParsedJSON(data: CistGroupsOutput): Promise<void> {
		const { groups, faculties, specialities, directions } = data

		for (const faculty of faculties) {
			const key = RedisKeyBuilder.facultyKey(faculty.id)

			const isExist = await this.cache.get(key)

			if (isExist) {
				continue
			}

			await this.db.insert(facultyTable).values(faculty)
			this.cache.set(key, 'exists')
		}

		for (const direction of directions) {
			const key = RedisKeyBuilder.directionKey(direction.id)

			const isExist = await this.cache.get(key)

			if (isExist) {
				continue
			}

			await this.db.insert(directionTable).values(direction)
			this.cache.set(key, 'exists')
		}

		for (const speciality of specialities) {
			const key = RedisKeyBuilder.specialityKey(speciality.id)

			const isExist = await this.cache.get(key)

			if (isExist) {
				continue
			}

			await this.db.insert(specialityTable).values(speciality)
			await this.cache.set(key, 'exists')
		}

		for (const group of groups) {
			const key = RedisKeyBuilder.groupKey(group.id)

			const isExist = await this.cache.get(key)

			if (isExist) {
				continue
			}

			await this.db.insert(academicGroupTable).values(group)
			await this.cache.set(key, 'exists')
		}
	}
}
