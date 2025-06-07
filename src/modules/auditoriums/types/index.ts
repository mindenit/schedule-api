import type { BaseDiConfig, InjectableDependencies } from '@/core/types/deps.js'
import type { BaseParser } from '@/core/types/parsers.js'
import type { Auditorium } from '@/db/types.js'

interface AuditoriumsModuleDependencies {
	auditoriumsParser: BaseParser<Auditorium>
}

type AuditoriumsInjectableDependencies =
	InjectableDependencies<AuditoriumsModuleDependencies>

type AuditoriumsDiConfig = BaseDiConfig<AuditoriumsModuleDependencies>

export type {
	AuditoriumsModuleDependencies,
	AuditoriumsDiConfig,
	AuditoriumsInjectableDependencies,
}
