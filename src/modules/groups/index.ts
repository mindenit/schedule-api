import { asClass } from 'awilix'
import { GroupsParserImpl } from './parsers/GroupsParser.js'
import type { GroupsDiConfig } from './types/index.js'
import { GroupsProcessorImpl } from './processors/GroupsProcessor.js'

export const resolveGroupsModule = (): GroupsDiConfig => ({
	groupsParser: asClass(GroupsParserImpl).singleton(),
	groupsProcessor: asClass(GroupsProcessorImpl).singleton(),
})
