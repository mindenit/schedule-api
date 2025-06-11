import type { CistParser, CistProcessor } from '@/core/types/cist.js'
import type { BaseDiConfig, InjectableDependencies } from '@/core/types/deps.js'
import type { CistGroupsOutput } from '@/core/types/proxy.js'
import type { Group } from '@/db/types.js'

interface GroupsModuleDependencies {
	groupsParser: CistParser<CistGroupsOutput>
	groupsProcessor: CistProcessor<Group[]>
}

type GroupsInjectableDependencies =
	InjectableDependencies<GroupsModuleDependencies>
type GroupsDiConfig = BaseDiConfig<GroupsModuleDependencies>

export type {
	GroupsDiConfig,
	GroupsInjectableDependencies,
	GroupsModuleDependencies,
}
