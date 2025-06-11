import { asClass } from 'awilix'
import { TeachersParserImpl } from './parsers/TeachersParser.js'
import { TeachersProcessorImpl } from './processors/TeachersProcessor.js'
import type { TeachersDiConfig } from './types/index.js'

export const resolveTeachersModule = (): TeachersDiConfig => ({
	teachersParser: asClass(TeachersParserImpl).singleton(),
	teachersProcessor: asClass(TeachersProcessorImpl).singleton(),
})
