import type { Department, Faculty, Teacher } from '@/db/types.js'
import type { Maybe } from '@/core/types/common.js'
import type { CommonDependencies } from '@/core/types/deps.js'
import type {
	CistTeachersOutput,
	CistTeachersRawJson,
	RawDepartment,
	RawTeacher,
} from '@/core/types/proxy.js'
import { fetchProxy } from '@/core/utils/proxy.js'
import type { CistParser } from '@/core/types/cist.js'

export class TeachersParserImpl implements CistParser<CistTeachersOutput> {
	private readonly endpoint: string
	private hashSet: Set<number>
	private teachers: Teacher[]

	constructor({ config }: CommonDependencies) {
		const { baseUrl } = config.proxy

		this.endpoint = `${baseUrl}/lists/teachers`
		this.hashSet = new Set()
		this.teachers = []
	}

	async parse(): Promise<Maybe<CistTeachersOutput>> {
		try {
			const raw = await fetchProxy<CistTeachersRawJson>(this.endpoint)

			const faculties: Faculty[] = []
			const departments: Department[] = []

			if (!Object.hasOwn(raw, 'university')) {
				return null
			}

			if (!Object.hasOwn(raw.university, 'faculties')) {
				return null
			}

			for (const faculty of raw.university.faculties) {
				faculties.push({
					id: faculty.id,
					fullName: faculty.full_name,
					shortName: faculty.short_name,
				})

				if (!Object.hasOwn(faculty, 'departments')) {
					continue
				}

				for (const department of faculty.departments) {
					departments.push({
						id: department.id,
						fullName: department.full_name,
						shortName: department.short_name,
						facultyId: faculty.id,
					})

					this.processDepartment(department)

					if (Object.hasOwn(department, 'departments')) {
						for (const subDepartment of department.departments) {
							departments.push({
								id: subDepartment.id,
								fullName: subDepartment.full_name,
								shortName: subDepartment.short_name,
								facultyId: faculty.id,
							})

							this.processDepartment(subDepartment)
						}
					}
				}
			}

			return { teachers: this.teachers, faculties, departments }
		} catch (e) {
			const message = e instanceof Error ? e.message : String(e)

			throw new Error(
				`[TeachersParser] Failed to fetch or parse teachers data: ${message}`,
			)
		}
	}

	private processDepartment(department: RawDepartment) {
		if (Object.hasOwn(department, 'teachers')) {
			for (const teacher of department.teachers) {
				this.addTeacher(teacher, department.id)
			}
		}
	}

	private addTeacher(teacher: RawTeacher, departmentId: number) {
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
			departmentId,
		})

		this.hashSet.add(teacher.id)
	}
}
