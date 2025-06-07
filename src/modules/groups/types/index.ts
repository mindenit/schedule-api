import type { BaseDiConfig } from '@/core/types/deps.js'
import type { BaseParser } from '@/core/types/parsers.js'
import type { CistGroupsOutput } from '@/core/types/proxy.js'

interface GroupsModuleDependencies {
	groupsParser: BaseParser<CistGroupsOutput>
}

type GroupsDiConfig = BaseDiConfig<GroupsModuleDependencies>

export type { GroupsModuleDependencies, GroupsDiConfig }
