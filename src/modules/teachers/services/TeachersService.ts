import type { BaseResponse } from '@/core/types/common.js'
import type {
	TeachersInjectableDependencies,
	TeachersRepository,
	TeachersService,
} from '../types/index.js'
import type {
	Auditorium,
	Group,
	Schedule,
	Subject,
	Teacher,
} from '@/db/types.js'
import type { GET_SCHEDULE_OPTIONS } from '@/modules/schedule/schemas/index.js'
import { successResponse } from '@/core/utils/response.js'
import type { GET_TEACHER_SCHEDULE_FILTERS } from '../schemas/index.js'

export class TeachersServiceImpl implements TeachersService {
	private readonly repository: TeachersRepository

	constructor({ teachersRepository }: TeachersInjectableDependencies) {
		this.repository = teachersRepository
	}

	async getAll(): Promise<BaseResponse<Teacher[]>> {
		const teachers = await this.repository.findAll()

		return successResponse(teachers, 'Teachers successfuly fetched')
	}

	async getAuditoriums(
		teacherId: number,
	): Promise<BaseResponse<Pick<Auditorium, 'id' | 'name'>[]>> {
		const auditoriums = await this.repository.getAuditoriums(teacherId)

		const message = `Auditoriums for teacher with id ${teacherId} found successfully`

		return success(auditoriums, message)
	}

	async getGroups(
		teacherId: number,
	): Promise<BaseResponse<Pick<Group, 'id' | 'name'>[]>> {
		const groups = await this.repository.getGroups(teacherId)

		const message = `Groups for teacher with id ${teacherId} found successfully`

		return success(groups, message)
	}

	async getSubjects(teacherId: number): Promise<BaseResponse<Subject[]>> {
		const subjects = await this.repository.getSubjects(teacherId)

		const message = `Subjects for teacher with id ${teacherId} found successfully`

		return success(subjects, message)
	}

	async getSchedule(
		options: GET_SCHEDULE_OPTIONS<GET_TEACHER_SCHEDULE_FILTERS>,
	): Promise<BaseResponse<Schedule[]>> {
		const schedule = await this.repository.getSchedule(options)

		const message = `Schedule for teacher with id ${options.id} found successfully`

		return successResponse(schedule, message)
	}
}
