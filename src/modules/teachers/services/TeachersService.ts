import type { DatabaseClient } from '@/core/types/deps.js'
import type { Redis } from 'ioredis'
import type { TeachersInjectableDependencies } from '../types/index.js'
import type { CistTeachersOutput } from '@/core/types/proxy.js'
import { facultyTable } from '@/db/schema/faculty.js'
import { teacherTable } from '@/db/schema/teacher.js'
import { departmentTable } from '@/db/schema/department.js'
import type { CistService } from '@/core/types/services.js'
import { RedisKeyBuilder } from '@/core/builders/RedisKeyBulder.js'

export class TeachersService implements CistService<CistTeachersOutput> {
	private readonly db: DatabaseClient
	private readonly cache: Redis

	constructor({ db, cache }: TeachersInjectableDependencies) {
		this.db = db.client
		this.cache = cache
	}

	async processParsedJSON(data: CistTeachersOutput): Promise<void> {
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
	}
}
