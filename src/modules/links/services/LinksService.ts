import type {
	BaseResponse,
	FailureResponse,
	SuccessResponse,
} from '@/core/types/common.js'
import { failureResponse, successResponse } from '@/core/utils/response.js'
import { err, ok, Result } from 'neverthrow'
import type { CREATE_LINK, Link, UPDATE_LINK } from '../schemas/index.js'
import type {
	LinksInjectableDependencies,
	LinksRepository,
	LinksService,
} from '../types/index.js'

export class LinksServiceImpl implements LinksService {
	private readonly repository: LinksRepository

	constructor({ linksRepository }: LinksInjectableDependencies) {
		this.repository = linksRepository
	}

	async getUserLinks(userId: string): Promise<BaseResponse<Link[]>> {
		const pattern = `${userId}:links:*`

		const links = await this.repository.findMany(pattern)

		return successResponse(links, 'User links retrieved successfully')
	}

	async createOne(
		userId: string,
		data: CREATE_LINK,
	): Promise<BaseResponse<Link>> {
		const link = await this.repository.createOne(userId, data)

		return successResponse(link, 'Link created successfully')
	}

	async updateOne(
		id: string,
		userId: string,
		data: UPDATE_LINK,
	): Promise<Result<SuccessResponse<Link>, FailureResponse>> {
		const existingLink = await this.repository.findOne(id, userId)

		if (!existingLink) {
			return err(
				failureResponse({
					status: 404,
					message: 'Link not found',
				}),
			)
		}

		await this.repository.updateOne(id, userId, data)

		const link = {
			...existingLink,
			...data,
		}

		return ok(successResponse(link, 'Link updated successfully'))
	}

	async deleteOne(
		id: string,
		userId: string,
	): Promise<Result<SuccessResponse<Link>, FailureResponse>> {
		const existingLink = await this.repository.findOne(id, userId)

		if (!existingLink) {
			return err(
				failureResponse({
					status: 404,
					message: 'Link not found',
				}),
			)
		}

		await this.repository.deleteOne(id, userId)

		return ok(successResponse(existingLink, 'Link deleted successfully'))
	}
}
