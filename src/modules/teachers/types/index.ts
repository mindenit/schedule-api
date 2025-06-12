import type { CistParser, CistProcessor } from '@/core/types/cist.js'
import type { BaseDiConfig, InjectableDependencies } from '@/core/types/deps.js'
import type { CistTeachersOutput } from '@/core/types/proxy.js'
import type { Teacher } from '@/db/types.js'

interface TeachersModuleDependencies {
	teachersParser: CistParser<CistTeachersOutput>
	teachersProcessor: CistProcessor<Teacher[]>
}

type TeachersInjectableDependencies =
	InjectableDependencies<TeachersModuleDependencies>

type TeachersDiConfig = BaseDiConfig<TeachersModuleDependencies>

export type {
	TeachersDiConfig,
	TeachersInjectableDependencies,
	TeachersModuleDependencies,
}
