import type { CistParser, CistProcessor } from '@/core/types/cist.js'
import type { DatabaseClient } from '@/core/types/deps.js'
import type { CistTeachersOutput } from '@/core/types/proxy.js'
import type { Teacher } from '@/db/types.js'
import type { Redis } from 'ioredis'
import type { TeachersInjectableDependencies } from '../types/index.js'
import {
	departmentTable,
	facultyTable,
	teacherTable,
} from '@/db/schema/index.js'
import { RedisKeyBuilder } from '@/core/builders/RedisKeyBulder.js'

export class TeachersProcessorImpl implements CistProcessor<Teacher[]> {
	private readonly db: DatabaseClient
	private readonly cache: Redis
	private readonly parser: CistParser<CistTeachersOutput>

	constructor({ db, cache, teachersParser }: TeachersInjectableDependencies) {
		this.db = db.client
		this.cache = cache
		this.parser = teachersParser
	}

	async process(): Promise<Teacher[]> {
		try {
			const data = await this.parser.parse()

			if (!data) {
				return []
			}

			const { teachers, faculties, departments } = data

			for (const faculty of faculties) {
				const key = RedisKeyBuilder.facultyKey(faculty.id)

				const isExist = await this.cache.get(key)

				if (isExist) {
					continue
				}

				await this.db.insert(facultyTable).values(faculty)
				await this.cache.set(key, 'exists')
			}

			for (const department of departments) {
				const key = RedisKeyBuilder.departmentKey(department.id)

				const isExist = await this.cache.get(key)

				if (isExist) {
					continue
				}

				await this.db.insert(departmentTable).values(department)
				this.cache.set(key, 'exists')
			}

			for (const teacher of teachers) {
				const key = RedisKeyBuilder.teacherKey(teacher.id)

				const isExist = await this.cache.get(key)

				if (isExist) {
					continue
				}

				await this.db.insert(teacherTable).values(teacher)
				this.cache.set(key, 'exists')
			}

			return teachers
		} catch (e: unknown) {
			if (e instanceof Error && e.message.includes('[TeachersParser]')) {
				throw new Error(e.message)
			}

			const message = `[TeachersProcessor] Failed to process data: ${e instanceof Error ? e.message : 'Unknown error'}`

			throw new Error(message)
		}
	}
}
