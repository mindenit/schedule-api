import { asClass } from 'awilix'
import type { MoodleDiConfig } from './types/di.js'
import { MoodleServiceImpl } from './services/MoodleService.js'
import { MoodleRepositoryImpl } from './repositories/MoodleRepository.js'

export const resolveMoodleModule = (): MoodleDiConfig => ({
	moodleService: asClass(MoodleServiceImpl).singleton(),
	moodleRepository: asClass(MoodleRepositoryImpl).singleton(),
})
