import type { BaseResponse } from '@/core/types/common.js'
import type {
	GroupsInjectableDependencies,
	GroupsRepository,
	GroupsService,
} from '../types/index.js'
import type { Group, Schedule } from '@/db/types.js'
import type { GET_SCHEDULE_OPTIONS } from '@/modules/schedule/schemas/index.js'

export class GroupsServiceImpl implements GroupsService {
	private readonly repository: GroupsRepository

	constructor({ groupsRepository }: GroupsInjectableDependencies) {
		this.repository = groupsRepository
	}

	async getAll(): Promise<BaseResponse<Group[]>> {
		const groups = await this.repository.findAll()

		return {
			success: true,
			data: groups,
			message: 'Groups fetched successfully',
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
			message: `Schedule for group with id ${options.id} found successfully`,
			error: null,
		}
	}
}
