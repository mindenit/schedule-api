import { asClass } from 'awilix'
import { AuditoriumsParserImpl } from './parsers/AuditoriumsParser.js'
import { AuditoriumProcessorImpl } from './processors/AuditoriumProcessor.js'
import type { AuditoriumsDiConfig } from './types/index.js'

export const resolveAuditoriumsModule = (): AuditoriumsDiConfig => ({
	auditoriumsParser: asClass(AuditoriumsParserImpl).singleton(),
	auditoriumsProcessor: asClass(AuditoriumProcessorImpl).singleton(),
})
