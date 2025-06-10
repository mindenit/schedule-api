import type { BaseDiConfig, InjectableDependencies } from '@/core/types/deps.js'
import type { BaseParser } from '@/core/types/parsers.js'
import type { CistGroupsOutput } from '@/core/types/proxy.js'
import type { CistService } from '@/core/types/services.js'

interface GroupsModuleDependencies {
	groupsParser: BaseParser<CistGroupsOutput>
	groupsService: CistService<CistGroupsOutput>
}

type GroupsInjectableDependencies =
	InjectableDependencies<GroupsModuleDependencies>
type GroupsDiConfig = BaseDiConfig<GroupsModuleDependencies>

export type {
	GroupsDiConfig,
	GroupsInjectableDependencies,
	GroupsModuleDependencies,
}
