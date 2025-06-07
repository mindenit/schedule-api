import type { BaseDiConfig } from '@/core/types/deps.js'
import type { BaseParser } from '@/core/types/parsers.js'
import type { Auditorium } from '@/db/types.js'

interface AuditoriumsModuleDependencies {
	auditoriumsParser: BaseParser<Auditorium>
}

type AuditoriumsDiConfig = BaseDiConfig<AuditoriumsModuleDependencies>

export type { AuditoriumsModuleDependencies, AuditoriumsDiConfig }
