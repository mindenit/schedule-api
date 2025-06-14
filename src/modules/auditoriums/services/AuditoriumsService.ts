import type { BaseResponse } from '@/core/types/common.js'
import type {
	AuditoriumsInjectableDependencies,
	AuditoriumsRepository,
	AuditoriumsService,
} from '../types/index.js'
import type { Auditorium, Schedule } from '@/db/types.js'
import type { GET_SCHEDULE_OPTIONS } from '@/modules/schedule/schemas/index.js'
import { success } from '@/core/utils/response.js'

export class AuditoriumsServiceImpl implements AuditoriumsService {
	repository: AuditoriumsRepository

	constructor({ auditoriumsRepository }: AuditoriumsInjectableDependencies) {
		this.repository = auditoriumsRepository
	}

	async getAuditoriums(): Promise<BaseResponse<Auditorium[]>> {
		const auditoriums = await this.repository.findAll()

		const message = 'Auditoriums fetched successfully'

		return success(auditoriums, message)
	}

	async getSchedule(
		options: GET_SCHEDULE_OPTIONS,
	): Promise<BaseResponse<Schedule[]>> {
		const schedule = await this.repository.getSchedule(options)

		const message = `Schedule for auditorium with id ${options.id} found successfully`

		return success(schedule, message)
	}
}
