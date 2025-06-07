import { asClass } from 'awilix'
import { AuditoriumParserImpl } from './parsers/AuditoriumsParser.js'
import type { AuditoriumsDiConfig } from './types/index.js'

export const resolveAuditoriumsModule = (): AuditoriumsDiConfig => ({
	auditoriumsParser: asClass(AuditoriumParserImpl).singleton(),
})
