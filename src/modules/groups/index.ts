import { asClass } from 'awilix'
import { GroupsParserImpl } from './parsers/GroupsParser.js'
import type { GroupsDiConfig } from './types/index.js'
import { GroupsProcessorImpl } from './processors/GroupsProcessor.js'
import { GroupsRepositoryImpl } from './repositories/GroupsRepository.js'
import { GroupsServiceImpl } from './services/GroupsService.js'

export const resolveGroupsModule = (): GroupsDiConfig => ({
	groupsParser: asClass(GroupsParserImpl).singleton(),
	groupsProcessor: asClass(GroupsProcessorImpl).singleton(),
	groupsRepository: asClass(GroupsRepositoryImpl).singleton(),
	groupsService: asClass(GroupsServiceImpl).singleton(),
})
