import type { BaseResponse } from '@/core/types/common.js'
import type {
	AuditoriumsInjectableDependencies,
	AuditoriumsRepository,
	AuditoriumsService,
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
import { isDLAuditorium } from '../utils/index.js'
import type { GET_AUDITORIUM_SCHEDULE_FILTERS } from '../schemas/index.js'

export class AuditoriumsServiceImpl implements AuditoriumsService {
	repository: AuditoriumsRepository

	constructor({ auditoriumsRepository }: AuditoriumsInjectableDependencies) {
		this.repository = auditoriumsRepository
	}

	async getAuditoriums(): Promise<BaseResponse<Auditorium[]>> {
		const auditoriums = await this.repository.findAll()
		const message = 'Auditoriums fetched successfully'

		return successResponse(auditoriums, message)
	}

	async getGroups(
		auditoriumId: number,
	): Promise<BaseResponse<Pick<Group, 'id' | 'name'>[]>> {
		const auditorium = await this.repository.findOne(auditoriumId)
		const message = `Groups for auditorium with id ${auditoriumId} found successfully`

		if (isDLAuditorium(auditorium)) {
			return success([], message)
		}

		const groups = await this.repository.getGroups(auditoriumId)

		return success(groups, message)
	}

	async getTeachers(
		auditoriumId: number,
	): Promise<BaseResponse<Omit<Teacher, 'departmentId'>[]>> {
		const auditorium = await this.repository.findOne(auditoriumId)
		const message = `Teachers for auditorium with id ${auditoriumId} found successfully`

		if (isDLAuditorium(auditorium)) {
			return success([], message)
		}

		const teachers = await this.repository.getTeachers(auditoriumId)

		return success(teachers, message)
	}

	async getSubjects(auditoriumId: number): Promise<BaseResponse<Subject[]>> {
		const auditorium = await this.repository.findOne(auditoriumId)
		const message = `Subjects for auditorium with id ${auditoriumId} found successfully`

		if (isDLAuditorium(auditorium)) {
			return success([], message)
		}

		const subjects = await this.repository.getSubjects(auditoriumId)

		return success(subjects, message)
	}

	async getSchedule(
		options: GET_SCHEDULE_OPTIONS<GET_AUDITORIUM_SCHEDULE_FILTERS>,
	): Promise<BaseResponse<Schedule[]>> {
		const auditorium = await this.repository.findOne(options.id)
		const message = `Schedule for auditorium with id ${options.id} found successfully`

		if (isDLAuditorium(auditorium)) {
			return successResponse([], message)
		}

		const schedule = await this.repository.getSchedule(options)

		return successResponse(schedule, message)
	}
}
