import type { BaseResponse } from '@/core/types/common.js'
import type {
	TeachersInjectableDependencies,
	TeachersRepository,
	TeachersService,
} from '../types/index.js'
import type { Schedule, Teacher } from '@/db/types.js'
import type { GET_SCHEDULE_OPTIONS } from '@/modules/schedule/schemas/index.js'
import { successResponse } from '@/core/utils/response.js'

export class TeachersServiceImpl implements TeachersService {
	private readonly repository: TeachersRepository

	constructor({ teachersRepository }: TeachersInjectableDependencies) {
		this.repository = teachersRepository
	}

	async getAll(): Promise<BaseResponse<Teacher[]>> {
		const teachers = await this.repository.findAll()

		return successResponse(teachers, 'Teachers successfuly fetched')
	}

	async getSchedule(
		options: GET_SCHEDULE_OPTIONS,
	): Promise<BaseResponse<Schedule[]>> {
		const schedule = await this.repository.getSchedule(options)

		const message = `Schedule for teacher with id ${options.id} found successfully`

		return successResponse(schedule, message)
	}
}
