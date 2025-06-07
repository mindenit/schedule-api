import { asClass } from 'awilix'
import type { GroupsDiConfig } from './types/index.js'
import { GroupParserImpl } from './parsers/GroupsParser.js'

export const resolveGroupsModule = (): GroupsDiConfig => ({
	groupsParser: asClass(GroupParserImpl).singleton(),
})
