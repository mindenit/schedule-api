import type { CistParser, CistProcessor } from '@/core/types/cist.js'
import type { BaseResponse } from '@/core/types/common.js'
import type { BaseDiConfig, InjectableDependencies } from '@/core/types/deps.js'
import type { CistAuditoriumsOutput } from '@/core/types/proxy.js'
import type { Auditorium } from '@/db/types.js'

interface AuditoriumsRepository {
	findAll: () => Promise<Auditorium[]>
}

interface AuditoriumsService {
	getAuditoriums: () => Promise<BaseResponse<Auditorium[]>>
}

interface AuditoriumsModuleDependencies {
	auditoriumsParser: CistParser<CistAuditoriumsOutput>
	auditoriumsProcessor: CistProcessor<Auditorium[]>
	auditoriumsRepository: AuditoriumsRepository
	auditoriumsService: AuditoriumsService
}

type AuditoriumsInjectableDependencies =
	InjectableDependencies<AuditoriumsModuleDependencies>

type AuditoriumsDiConfig = BaseDiConfig<AuditoriumsModuleDependencies>

export type {
	AuditoriumsDiConfig,
	AuditoriumsInjectableDependencies,
	AuditoriumsModuleDependencies,
	AuditoriumsRepository,
	AuditoriumsService,
}
