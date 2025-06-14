import { asClass } from 'awilix'
import { AuditoriumsParserImpl } from './parsers/AuditoriumsParser.js'
import { AuditoriumProcessorImpl } from './processors/AuditoriumProcessor.js'
import type { AuditoriumsDiConfig } from './types/index.js'
import { AuditoriumsRepositoryImpl } from './repositories/AuditoriumsRepository.js'
import { AuditoriumsServiceImpl } from './services/AuditoriumsService.js'

export const resolveAuditoriumsModule = (): AuditoriumsDiConfig => ({
	auditoriumsParser: asClass(AuditoriumsParserImpl).singleton(),
	auditoriumsProcessor: asClass(AuditoriumProcessorImpl).singleton(),
	auditoriumsRepository: asClass(AuditoriumsRepositoryImpl).singleton(),
	auditoriumsService: asClass(AuditoriumsServiceImpl).singleton(),
})
