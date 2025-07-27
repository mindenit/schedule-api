import type { FailureResponse, SuccessResponse } from '@/core/types/common.js'
import { err, ok, type Result } from 'neverthrow'
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
			return err(
				failureResponse({
					status: 404,
					message: 'Sharable link not found',
				}),
			)
		}

		return ok(successResponse(sharableLink, 'Sharable link found successfully'))
	}
}
