import type { GenericResponse } from '@/core/types/common.js'
import type {
	AuditoriumsInjectableDependencies,
	AuditoriumsRepository,
	AuditoriumsService,
} from '../types/index.js'
import type { Auditorium } from '@/db/types.js'

export class AuditoriumsServiceImpl implements AuditoriumsService {
	repository: AuditoriumsRepository

	constructor({ auditoriumsRepository }: AuditoriumsInjectableDependencies) {
		this.repository = auditoriumsRepository
	}

	async getAuditoriums(): Promise<GenericResponse<Auditorium[]>> {
		const auditoriums = await this.repository.findAll()

		return {
			success: true,
			data: auditoriums,
			message: 'Auditoriums fetched successfully',
			error: null,
		}
	}
}
