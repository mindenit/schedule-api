import type { CistParser, CistProcessor } from '@/core/types/cist.js'
import type { BaseResponse } from '@/core/types/common.js'
import type { BaseDiConfig, InjectableDependencies } from '@/core/types/deps.js'
import type { CistTeachersOutput } from '@/core/types/proxy.js'
import type { Schedulable } from '@/core/types/services.js'
import type {
	Auditorium,
	Group,
	Schedule,
	Subject,
	Teacher,
} from '@/db/types.js'
import type { GET_TEACHER_SCHEDULE_FILTERS } from '../schemas/index.js'

interface TeachersRepository extends Schedulable<GET_TEACHER_SCHEDULE_FILTERS> {
	findAll: () => Promise<Teacher[]>
	getSubjects: (teacherId: number) => Promise<Subject[]>
	getGroups: (teacherId: number) => Promise<Pick<Group, 'id' | 'name'>[]>
	getAuditoriums: (
		teacherId: number,
	) => Promise<Pick<Auditorium, 'id' | 'name'>[]>
}

interface TeachersService
	extends Schedulable<GET_TEACHER_SCHEDULE_FILTERS, BaseResponse<Schedule[]>> {
	getAll: () => Promise<BaseResponse<Teacher[]>>
	getAuditoriums: (
		teacherId: number,
	) => Promise<BaseResponse<Pick<Auditorium, 'id' | 'name'>[]>>
	getGroups: (
		teacherId: number,
	) => Promise<BaseResponse<Pick<Group, 'id' | 'name'>[]>>
	getSubjects: (teacherId: number) => Promise<BaseResponse<Subject[]>>
}

interface TeachersModuleDependencies {
	teachersParser: CistParser<CistTeachersOutput>
	teachersProcessor: CistProcessor<Teacher[]>
	teachersRepository: TeachersRepository
	teachersService: TeachersService
}

type TeachersInjectableDependencies =
	InjectableDependencies<TeachersModuleDependencies>

type TeachersDiConfig = BaseDiConfig<TeachersModuleDependencies>

export type {
	TeachersDiConfig,
	TeachersInjectableDependencies,
	TeachersModuleDependencies,
	TeachersRepository,
	TeachersService,
}
