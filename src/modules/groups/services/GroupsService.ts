import type { BaseResponse } from '@/core/types/common.js'
import type {
	GroupsInjectableDependencies,
	GroupsRepository,
	GroupsService,
} from '../types/index.js'
import type { Group, Schedule, Subject, Teacher } from '@/db/types.js'
import type { GET_SCHEDULE_OPTIONS } from '@/modules/schedule/schemas/index.js'
import { success } from '@/core/utils/index.js'

export class GroupsServiceImpl implements GroupsService {
	private readonly repository: GroupsRepository

	constructor({ groupsRepository }: GroupsInjectableDependencies) {
		this.repository = groupsRepository
	}

	async getAll(): Promise<BaseResponse<Group[]>> {
		const groups = await this.repository.findAll()

		return success(groups, 'Groups fetched successfully')
	}

	async getSubjects(groupId: number): Promise<BaseResponse<Subject[]>> {
		const subjects = await this.repository.getSubjects(groupId)

		return success(
			subjects,
			`Subjects for group ${groupId} fetched successfully`,
		)
	}

	async getTeachers(
		groupId: number,
	): Promise<BaseResponse<Omit<Teacher, 'departmentId'>[]>> {
		const teachers = await this.repository.getTeachers(groupId)

		return success(
			teachers,
			`Teachers for group ${groupId} fetched successfully`,
		)
	}

	async getSchedule(
		options: GET_SCHEDULE_OPTIONS,
	): Promise<BaseResponse<Schedule[]>> {
		const schedule = await this.repository.getSchedule(options)

		const message = `Schedule for group with id ${options.id} found successfully`

		return success(schedule, message)
	}
}
