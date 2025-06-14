import type { BaseResponse } from '@/core/types/common.js'
import type {
	AuditoriumsInjectableDependencies,
	AuditoriumsRepository,
	AuditoriumsService,
} from '../types/index.js'
import type { Auditorium, Schedule } from '@/db/types.js'
import type { GET_SCHEDULE_OPTIONS } from '@/modules/schedule/schemas/index.js'

export class AuditoriumsServiceImpl implements AuditoriumsService {
	repository: AuditoriumsRepository

	constructor({ auditoriumsRepository }: AuditoriumsInjectableDependencies) {
		this.repository = auditoriumsRepository
	}

	async getAuditoriums(): Promise<BaseResponse<Auditorium[]>> {
		const auditoriums = await this.repository.findAll()

		return {
			success: true,
			data: auditoriums,
			message: 'Auditoriums fetched successfully',
			error: null,
		}
	}

	async getSchedule(
		options: GET_SCHEDULE_OPTIONS,
	): Promise<BaseResponse<Schedule[]>> {
		const schedule = await this.repository.getSchedule(options)

		return {
			success: true,
			data: schedule,
			message: `Schedule for auditorium with id ${options.id} found successfully`,
			error: null,
		}
	}
}
