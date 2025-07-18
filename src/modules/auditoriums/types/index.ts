import type { CistParser, CistProcessor } from '@/core/types/cist.js'
import type { BaseResponse, Maybe } from '@/core/types/common.js'
import type { BaseDiConfig, InjectableDependencies } from '@/core/types/deps.js'
import type { CistAuditoriumsOutput } from '@/core/types/proxy.js'
import type { FindableById, Schedulable } from '@/core/types/services.js'
import type { Auditorium, Schedule } from '@/db/types.js'

interface AuditoriumsRepository extends Schedulable, FindableById<Auditorium> {
	findOne: (id: number) => Promise<Maybe<Auditorium>>
	findAll: () => Promise<Auditorium[]>
}

interface AuditoriumsService extends Schedulable<BaseResponse<Schedule[]>> {
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
