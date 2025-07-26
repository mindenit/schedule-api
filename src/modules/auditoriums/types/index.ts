import type { CistParser, CistProcessor } from '@/core/types/cist.js'
import type { BaseResponse } from '@/core/types/common.js'
import type { BaseDiConfig, InjectableDependencies } from '@/core/types/deps.js'
import type { CistAuditoriumsOutput } from '@/core/types/proxy.js'
import type { FindableById, Schedulable } from '@/core/types/services.js'
import type {
	Auditorium,
	Group,
	Schedule,
	Subject,
	Teacher,
} from '@/db/types.js'
import type { GET_AUDITORIUM_SCHEDULE_FILTERS } from '../schemas/index.js'

interface AuditoriumsRepository
	extends Schedulable<GET_AUDITORIUM_SCHEDULE_FILTERS>,
		FindableById<Auditorium> {
	findAll: () => Promise<Auditorium[]>
	getGroups: (auditoriumId: number) => Promise<Pick<Group, 'id' | 'name'>[]>
	getTeachers: (
		auditoriumId: number,
	) => Promise<Omit<Teacher, 'departmentId'>[]>
	getSubjects: (auditoriumId: number) => Promise<Subject[]>
}

interface AuditoriumsService
	extends Schedulable<
		GET_AUDITORIUM_SCHEDULE_FILTERS,
		BaseResponse<Schedule[]>
	> {
	getAuditoriums: () => Promise<BaseResponse<Auditorium[]>>
	getGroups: (
		auditoriumId: number,
	) => Promise<BaseResponse<Pick<Group, 'id' | 'name'>[]>>
	getTeachers: (
		auditoriumId: number,
	) => Promise<BaseResponse<Omit<Teacher, 'departmentId'>[]>>
	getSubjects: (auditoriumId: number) => Promise<BaseResponse<Subject[]>>
}

interface AuditoriumsModuleDependencies {
	auditoriumsParser: CistParser<CistAuditoriumsOutput>
	auditoriumsProcessor: CistProcessor<Auditorium[]>
	auditoriumsRepository: AuditoriumsRepository
	auditoriumsService: AuditoriumsService
}

type AuditoriumsInjectableDependencies =
	InjectableDependencies<AuditoriumsModuleDependencies>

type AuditoriumsDiConfig = BaseDiConfig<AuditoriumsModuleDependencies>

export type {
	AuditoriumsDiConfig,
	AuditoriumsInjectableDependencies,
	AuditoriumsModuleDependencies,
	AuditoriumsRepository,
	AuditoriumsService,
}
