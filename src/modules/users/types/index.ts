import type { BaseDiConfig, InjectableDependencies } from '@/core/types/deps.js'
import type { HttpError } from '@/core/types/index.js'
import type { Result } from '@/core/utils/index.js'
import type { User } from '@/db/types.js'
import type { CREATE_USER_TYPE } from '../schemas/index.js'

interface IUsersRepository {
	findAll: () => Promise<User[]>
	createOne: (data: CREATE_USER_TYPE) => Promise<Result<User, HttpError>>
}

interface UsersModuleDependencies {
	usersRepository: IUsersRepository
}

type UsersInjectableDependencies =
	InjectableDependencies<UsersModuleDependencies>

type UsersDiConfig = BaseDiConfig<UsersModuleDependencies>

export type {
	IUsersRepository,
	UsersDiConfig,
	UsersInjectableDependencies,
	UsersModuleDependencies,
}
