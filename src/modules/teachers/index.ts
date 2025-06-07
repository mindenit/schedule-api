import { asClass } from 'awilix'
import type { TeachersDiConfig } from './types/index.js'
import { TeachersParserImpl } from './parsers/TeachersParser.js'

export const resolveTeachersModule = (): TeachersDiConfig => ({
	teachersParser: asClass(TeachersParserImpl).singleton(),
})
