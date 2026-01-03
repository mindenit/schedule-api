import type { CistParser, CistProcessor } from '@/core/types/cist.js'
import type { DatabaseClient } from '@/core/types/deps.js'
import type { CistGroupsOutput } from '@/core/types/proxy.js'
import type { Group } from '@/db/types.js'
import type { Redis } from 'ioredis'
import type { GroupsInjectableDependencies } from '../types/index.js'
import { RedisKeyBuilder } from '@/core/builders/RedisKeyBulder.js'
import {
	academicGroupTable,
	directionTable,
	facultyTable,
	specialityTable,
} from '@/db/schema/index.js'

export class GroupsProcessorImpl implements CistProcessor<Group[]> {
	private readonly db: DatabaseClient
	private readonly cache: Redis
	private readonly parser: CistParser<CistGroupsOutput>

	constructor({ db, cache, groupsParser }: GroupsInjectableDependencies) {
		this.db = db.client
		this.cache = cache
		this.parser = groupsParser
	}

	async process(): Promise<Group[]> {
		try {
			const data = await this.parser.parse()

			if (!data) {
				return []
			}

			const { groups, faculties, specialities, directions } = data

			for (const faculty of faculties) {
				const key = RedisKeyBuilder.facultyKey(faculty.id)

				const isExist = await this.cache.get(key)

				if (isExist) {
					continue
				}

				await this.db.insert(facultyTable).values(faculty).onConflictDoNothing()
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

			return groups
		} catch (e: unknown) {
			if (e instanceof Error && e.message.includes('[GroupsParser]')) {
				throw new Error(e.message)
			}

			const message = `[GroupsProcessor] Failed to process data: ${e instanceof Error ? e.message : 'Unknown error'}`

			throw new Error(message)
		}
	}
}
