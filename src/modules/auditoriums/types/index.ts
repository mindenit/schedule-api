import type { BaseDiConfig, InjectableDependencies } from '@/core/types/deps.js'
import type { BaseParser } from '@/core/types/parsers.js'
import type { CistAuditoriumsOutput } from '@/core/types/proxy.js'
import type { CistService } from '@/core/types/services.js'

interface AuditoriumsModuleDependencies {
	auditoriumsParser: BaseParser<CistAuditoriumsOutput>
	auditoriumsService: CistService<CistAuditoriumsOutput>
}

type AuditoriumsInjectableDependencies =
	InjectableDependencies<AuditoriumsModuleDependencies>

type AuditoriumsDiConfig = BaseDiConfig<AuditoriumsModuleDependencies>

export type {
	AuditoriumsDiConfig,
	AuditoriumsInjectableDependencies,
	AuditoriumsModuleDependencies,
}
