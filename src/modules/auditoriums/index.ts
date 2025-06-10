import { asClass } from 'awilix'
import { AuditoriumParserImpl } from './parsers/AuditoriumsParser.js'
import type { AuditoriumsDiConfig } from './types/index.js'
import { AuditoriumsService } from './services/AuditoriumsService.js'

export const resolveAuditoriumsModule = (): AuditoriumsDiConfig => ({
	auditoriumsParser: asClass(AuditoriumParserImpl).singleton(),
	auditoriumsService: asClass(AuditoriumsService).singleton(),
})
