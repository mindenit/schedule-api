import type { BaseResponse } from '@/core/types/common.js'
import type {
	TeachersInjectableDependencies,
	TeachersRepository,
	TeachersService,
} from '../types/index.js'
import type { Teacher } from '@/db/types.js'

export class TeachersServiceImpl implements TeachersService {
	private readonly repository: TeachersRepository

	constructor({ teachersRepository }: TeachersInjectableDependencies) {
		this.repository = teachersRepository
	}

	async getAll(): Promise<BaseResponse<Teacher[]>> {
		const teachers = await this.repository.findAll()

		return {
			success: true,
			data: teachers,
			message: 'Teachers successfuly fetched',
			error: null,
		}
	}
}
