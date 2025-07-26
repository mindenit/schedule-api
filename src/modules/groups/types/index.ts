import type { CistParser, CistProcessor } from '@/core/types/cist.js'
import type { BaseResponse } from '@/core/types/common.js'
import type { BaseDiConfig, InjectableDependencies } from '@/core/types/deps.js'
import type { CistGroupsOutput } from '@/core/types/proxy.js'
import type { Schedulable } from '@/core/types/services.js'
import type {
	Auditorium,
	Group,
	Schedule,
	Subject,
	Teacher,
} from '@/db/types.js'
import type { GET_GROUP_SCHEDULE_FILTERS } from '../schemas/index.js'

interface GroupsRepository extends Schedulable<GET_GROUP_SCHEDULE_FILTERS> {
	findAll: () => Promise<Group[]>
	getAuditoriums: (
		groupId: number,
	) => Promise<Pick<Auditorium, 'id' | 'name'>[]>
	getSubjects: (groupId: number) => Promise<Subject[]>
	getTeachers: (groupId: number) => Promise<Omit<Teacher, 'departmentId'>[]>
}

interface GroupsService
	extends Schedulable<GET_GROUP_SCHEDULE_FILTERS, BaseResponse<Schedule[]>> {
	getAll: () => Promise<BaseResponse<Group[]>>
	getAuditoriums: (
		groupId: number,
	) => Promise<BaseResponse<Pick<Auditorium, 'id' | 'name'>[]>>
	getSubjects: (groupId: number) => Promise<BaseResponse<Subject[]>>
	getTeachers: (
		groupId: number,
	) => Promise<BaseResponse<Omit<Teacher, 'departmentId'>[]>>
}

interface GroupsModuleDependencies {
	groupsParser: CistParser<CistGroupsOutput>
	groupsProcessor: CistProcessor<Group[]>
	groupsRepository: GroupsRepository
	groupsService: GroupsService
}

type GroupsInjectableDependencies =
	InjectableDependencies<GroupsModuleDependencies>
type GroupsDiConfig = BaseDiConfig<GroupsModuleDependencies>

export type {
	GroupsDiConfig,
	GroupsInjectableDependencies,
	GroupsModuleDependencies,
	GroupsRepository,
	GroupsService,
}
