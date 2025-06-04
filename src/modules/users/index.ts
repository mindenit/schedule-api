import { asClass } from 'awilix'
import { UsersRepository } from './repositories/UsersRepository.js'
import type { UsersDiConfig } from './types/index.js'

export const resolveUsersModule = (): UsersDiConfig => ({
	usersRepository: asClass(UsersRepository).singleton(),
})
