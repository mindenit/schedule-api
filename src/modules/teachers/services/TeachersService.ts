import type { DatabaseClient } from '@/core/types/deps.js'
import type { Redis } from 'ioredis'
import type { TeachersInjectableDependencies } from '../types/index.js'
import type { CistTeachersOutput } from '@/core/types/proxy.js'
import { facultyTable } from '@/db/schema/faculty.js'
import { teacherTable } from '@/db/schema/teacher.js'
import { departmentTable } from '@/db/schema/department.js'

export class TeachersService {
	private readonly db: DatabaseClient
	private readonly cache: Redis

	constructor({ db, cache }: TeachersInjectableDependencies) {
		this.db = db.client
		this.cache = cache
	}

	async processParsedJSON(data: CistTeachersOutput): Promise<void> {
		const { teachers, faculties, departments } = data

		for (const faculty of faculties) {
			const key = this.getFacultyKey(faculty.id)

			const isExist = await this.cache.get(key)

			if (isExist) {
				continue
			}

			await this.db.insert(facultyTable).values(faculty)
			await this.cache.set(key, 'exists')
		}

		for (const department of departments) {
			const key = this.getDepartmentsKey(department.id)

			const isExist = await this.cache.get(key)

			if (isExist) {
				continue
			}

			await this.db.insert(departmentTable).values(department)
			this.cache.set(key, 'exists')
		}

		for (const teacher of teachers) {
			const key = this.getTeacherKey(teacher.id)

			const isExist = await this.cache.get(key)

			if (isExist) {
				continue
			}

			await this.db.insert(teacherTable).values(teacher)
			this.cache.set(key, 'exists')
		}
	}

	private getFacultyKey(facultyId: number): string {
		return `faculties:${facultyId}`
	}

	private getDepartmentsKey(departmentId: number): string {
		return `departments:${departmentId}`
	}

	private getTeacherKey(teacherId: number): string {
		return `teachers:${teacherId}`
	}
}
