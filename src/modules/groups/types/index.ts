import type { CistParser, CistProcessor } from '@/core/types/cist.js'
import type { BaseResponse } from '@/core/types/common.js'
import type { BaseDiConfig, InjectableDependencies } from '@/core/types/deps.js'
import type { CistGroupsOutput } from '@/core/types/proxy.js'
import type { Schedulable } from '@/core/types/services.js'
import type { Group, Schedule } from '@/db/types.js'

interface GroupsRepository extends Schedulable<Schedule[]> {
	findAll: () => Promise<Group[]>
}

interface GroupsService extends Schedulable<BaseResponse<Schedule[]>> {
	getAll: () => Promise<BaseResponse<Group[]>>
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
