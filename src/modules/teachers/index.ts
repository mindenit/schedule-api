import { asClass } from 'awilix'
import type { TeachersDiConfig } from './types/index.js'
import { TeachersParserImpl } from './parsers/TeachersParser.js'
import { TeachersService } from './services/TeachersService.js'

export const resolveTeachersModule = (): TeachersDiConfig => ({
	teachersParser: asClass(TeachersParserImpl).singleton(),
	teachersService: asClass(TeachersService).singleton(),
})
