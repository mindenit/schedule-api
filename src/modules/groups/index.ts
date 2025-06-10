import { asClass } from 'awilix'
import type { GroupsDiConfig } from './types/index.js'
import { GroupParserImpl } from './parsers/GroupsParser.js'
import { GroupsService } from './services/GroupsService.js'

export const resolveGroupsModule = (): GroupsDiConfig => ({
	groupsParser: asClass(GroupParserImpl).singleton(),
	groupsService: asClass(GroupsService).singleton(),
})
