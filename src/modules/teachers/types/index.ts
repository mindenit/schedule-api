import type { CistParser, CistProcessor } from '@/core/types/cist.js'
import type { BaseResponse } from '@/core/types/common.js'
import type { BaseDiConfig, InjectableDependencies } from '@/core/types/deps.js'
import type { CistTeachersOutput } from '@/core/types/proxy.js'
import type { Teacher } from '@/db/types.js'

interface TeachersRepository {
	findAll: () => Promise<Teacher[]>
}

interface TeachersService {
	getAll: () => Promise<BaseResponse<Teacher[]>>
}

interface TeachersModuleDependencies {
	teachersParser: CistParser<CistTeachersOutput>
	teachersProcessor: CistProcessor<Teacher[]>
	teachersRepository: TeachersRepository
	teachersService: TeachersService
}

type TeachersInjectableDependencies =
	InjectableDependencies<TeachersModuleDependencies>

type TeachersDiConfig = BaseDiConfig<TeachersModuleDependencies>

export type {
	TeachersDiConfig,
	TeachersInjectableDependencies,
	TeachersModuleDependencies,
	TeachersRepository,
	TeachersService,
}
