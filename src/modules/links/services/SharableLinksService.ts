import type { FailureResponse, SuccessResponse } from '@/core/types/common.js'
import { Result } from 'better-result'
import type { SharableLink } from '../schemas/index.js'
import type {
	LinksInjectableDependencies,
	SharableLinksRepository,
	SharableLinksService,
} from '../types/index.js'
import { failureResponse, successResponse } from '@/core/utils/response.js'

export class SharableLinksServiceImpl implements SharableLinksService {
	private readonly repository: SharableLinksRepository

	constructor({ sharableLinksRepository }: LinksInjectableDependencies) {
		this.repository = sharableLinksRepository
	}

	async findOne(
		id: string,
	): Promise<Result<SuccessResponse<SharableLink>, FailureResponse>> {
		const sharableLink = await this.repository.findOne(id)

		if (!sharableLink) {
			return Result.err(
				failureResponse({
					status: 404,
					message: 'Sharable link not found',
				}),
			)
		}

		return Result.ok(
			successResponse(sharableLink, 'Sharable link found successfully'),
		)
	}

	async createOne(
		userId: string,
		data: string[],
	): Promise<SuccessResponse<{ id: string }>> {
		const id = await this.repository.createOne(userId, data)

		return successResponse({ id }, 'Sharable link created successfully')
	}

	async acceptOne(
		id: string,
		userId: string,
	): Promise<Result<void, FailureResponse>> {
		const sharableLink = await this.repository.findOne(id)

		if (!sharableLink) {
			return Result.err(
				failureResponse({
					status: 404,
					message: 'Sharable link not found',
				}),
			)
		}

		if (await this.repository.isAccepted(id, userId)) {
			return Result.err(
				failureResponse({
					status: 400,
					message: 'You have already accepted this sharable link',
				}),
			)
		}

		await Promise.all([
			this.repository.setAccepted(id, userId),
			this.repository.setAccepted(id, userId),
		])

		return Result.ok(undefined)
	}
}
