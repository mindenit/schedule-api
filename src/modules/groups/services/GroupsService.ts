import type { BaseResponse } from '@/core/types/common.js'
import type {
	GroupsInjectableDependencies,
	GroupsRepository,
	GroupsService,
} from '../types/index.js'
import type { Group } from '@/db/types.js'

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
}
