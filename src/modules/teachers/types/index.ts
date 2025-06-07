import type { BaseDiConfig, InjectableDependencies } from '@/core/types/deps.js'
import type { BaseParser } from '@/core/types/parsers.js'
import type { CistTeachersOutput } from '@/core/types/proxy.js'

interface TeachersModuleDependencies {
	teachersParser: BaseParser<CistTeachersOutput>
}

type TeachersInjectableDependencies =
	InjectableDependencies<TeachersModuleDependencies>

type TeachersDiConfig = BaseDiConfig<TeachersModuleDependencies>

export type {
	TeachersModuleDependencies,
	TeachersDiConfig,
	TeachersInjectableDependencies,
}
