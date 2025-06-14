import { asClass } from 'awilix'
import { TeachersParserImpl } from './parsers/TeachersParser.js'
import { TeachersProcessorImpl } from './processors/TeachersProcessor.js'
import type { TeachersDiConfig } from './types/index.js'
import { TeachersRepositoryImpl } from './repositories/TeachersRepository.js'
import { TeachersServiceImpl } from './services/TeachersService.js'

export const resolveTeachersModule = (): TeachersDiConfig => ({
	teachersParser: asClass(TeachersParserImpl).singleton(),
	teachersProcessor: asClass(TeachersProcessorImpl).singleton(),
	teachersRepository: asClass(TeachersRepositoryImpl).singleton(),
	teachersService: asClass(TeachersServiceImpl).singleton(),
})
