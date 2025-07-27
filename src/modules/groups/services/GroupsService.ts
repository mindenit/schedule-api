import type { BaseResponse } from '@/core/types/common.js'
import type {
	GroupsInjectableDependencies,
	GroupsRepository,
	GroupsService,
} from '../types/index.js'
import type {
	Auditorium,
	Group,
	Schedule,
	Subject,
	Teacher,
} from '@/db/types.js'
import type { GET_SCHEDULE_OPTIONS } from '@/modules/schedule/schemas/index.js'
import { successResponse } from '@/core/utils/index.js'
import type { GET_GROUP_SCHEDULE_FILTERS } from '../schemas/index.js'

export class GroupsServiceImpl implements GroupsService {
	private readonly repository: GroupsRepository

	constructor({ groupsRepository }: GroupsInjectableDependencies) {
		this.repository = groupsRepository
	}

	async getAll(): Promise<BaseResponse<Group[]>> {
		const groups = await this.repository.findAll()

		return successResponse(groups, 'Groups fetched successfully')
	}

	async getAuditoriums(
		groupId: number,
	): Promise<BaseResponse<Pick<Auditorium, 'id' | 'name'>[]>> {
		const auditoriums = await this.repository.getAuditoriums(groupId)

		return success(
			auditoriums,
			`Auditoriums for group ${groupId} fetched successfully`,
		)
	}

	async getSubjects(groupId: number): Promise<BaseResponse<Subject[]>> {
		const subjects = await this.repository.getSubjects(groupId)

		return successResponse(
			subjects,
			`Subjects for group ${groupId} fetched successfully`,
		)
	}

	async getTeachers(
		groupId: number,
	): Promise<BaseResponse<Omit<Teacher, 'departmentId'>[]>> {
		const teachers = await this.repository.getTeachers(groupId)

		return successResponse(
			teachers,
			`Teachers for group ${groupId} fetched successfully`,
		)
	}

	async getSchedule(
		options: GET_SCHEDULE_OPTIONS<GET_GROUP_SCHEDULE_FILTERS>,
	): Promise<BaseResponse<Schedule[]>> {
		const schedule = await this.repository.getSchedule(options)

		const message = `Schedule for group with id ${options.id} found successfully`

		return successResponse(schedule, message)
	}
}
