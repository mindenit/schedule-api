import type { Teacher } from '@/db/types.js'
import type { Maybe } from '../types/common.js'
import type { CommonDependencies } from '../types/deps.js'
import type { BaseParser } from '../types/parsers.js'
import type {
	CistTeachersRawJson,
	RawDepartment,
	RawTeacher,
} from '../types/proxy.js'
import { fetchProxy } from '../utils/proxy.js'

export class TeachersParser implements BaseParser<Teacher> {
	private readonly endpoint: string
	private hashSet: Set<number>
	private teachers: Teacher[]

	constructor({ config }: CommonDependencies) {
		const { baseUrl } = config.proxy

		this.endpoint = `${baseUrl}/lists/teachers`
		this.hashSet = new Set()
		this.teachers = []
	}

	async parse(): Promise<Maybe<Teacher[]>> {
		const raw = await fetchProxy<CistTeachersRawJson>(this.endpoint)

		if (!Object.hasOwn(raw, 'university')) {
			return null
		}

		if (!Object.hasOwn(raw.university, 'faculties')) {
			return null
		}

		for (const faculty of raw.university.faculties) {
			if (!Object.hasOwn(faculty, 'departments')) {
				continue
			}

			for (const department of faculty.departments) {
				this.processDepartment(department)

				if (Object.hasOwn(department, 'departments')) {
					for (const subDepartment of department.departments) {
						this.processDepartment(subDepartment)
					}
				}
			}
		}

		return this.teachers
	}

	private processDepartment(department: RawDepartment) {
		if (Object.hasOwn(department, 'teachers')) {
			for (const teacher of department.teachers) {
				this.addTeacher(teacher)
			}
		}
	}

	private addTeacher(teacher: RawTeacher) {
		if (!teacher.full_name.length || !teacher.short_name.length) {
			return
		}

		if (this.hashSet.has(teacher.id)) {
			return
		}

		this.teachers.push({
			id: teacher.id,
			shortName: teacher.short_name,
			fullName: teacher.full_name,
		})

		this.hashSet.add(teacher.id)
	}
}
