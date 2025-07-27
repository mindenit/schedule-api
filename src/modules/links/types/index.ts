import type {
	BaseResponse,
	FailureResponse,
	Maybe,
	SuccessResponse,
} from '@/core/types/common.js'
import type { InjectableDependencies } from '@/core/types/deps.js'
import type { FindableById } from '@/core/types/services.js'
import type { CREATE_LINK, Link, UPDATE_LINK } from '../schemas/index.js'
import type { Result } from 'neverthrow'

interface LinksRepository extends FindableById<Link, string, string> {
	findMany: (pattern: string) => Promise<Link[]>
	createOne: (userId: string, data: CREATE_LINK) => Promise<Link>
	updateOne: (id: string, userId: string, data: UPDATE_LINK) => Promise<void>
	deleteOne: (id: string, userId: string) => Promise<void>
}

interface LinksService {
	getUserLinks: (userId: string) => Promise<BaseResponse<Link[]>>
	createOne: (userId: string, data: CREATE_LINK) => Promise<BaseResponse<Link>>
	updateOne: (
		id: string,
		userId: string,
		data: UPDATE_LINK,
	) => Promise<Result<SuccessResponse<Link>, FailureResponse>>
	deleteOne: (
		id: string,
		userId: string,
	) => Promise<Result<SuccessResponse<Link>, FailureResponse>>
}

interface SharableLinksRepository extends FindableById<Maybe<string>, string> {
	createOne: (userId: string, data: string[]) => Promise<string>
}

interface LinksModuleDependencies {
	linksRepository: LinksRepository
	linksService: LinksService
	sharableLinksRepository: SharableLinksRepository
}

type LinksInjectableDependencies =
	InjectableDependencies<LinksModuleDependencies>

export type {
	LinksInjectableDependencies,
	LinksRepository,
	SharableLinksRepository,
	LinksModuleDependencies,
	LinksService,
}
