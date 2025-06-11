import type { CistParser, CistProcessor } from '@/core/types/cist.js'
import type { BaseDiConfig, InjectableDependencies } from '@/core/types/deps.js'
import type { CistAuditoriumsOutput } from '@/core/types/proxy.js'
import type { Auditorium } from '@/db/types.js'

interface AuditoriumsModuleDependencies {
	auditoriumsParser: CistParser<CistAuditoriumsOutput>
	auditoriumsProcessor: CistProcessor<Auditorium[]>
}

type AuditoriumsInjectableDependencies =
	InjectableDependencies<AuditoriumsModuleDependencies>

type AuditoriumsDiConfig = BaseDiConfig<AuditoriumsModuleDependencies>

export type {
	AuditoriumsDiConfig,
	AuditoriumsInjectableDependencies,
	AuditoriumsModuleDependencies,
}
