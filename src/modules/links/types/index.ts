import type {
	BaseResponse,
	FailureResponse,
	Maybe,
	SuccessResponse,
} from '@/core/types/common.js'
import type { BaseDiConfig, InjectableDependencies } from '@/core/types/deps.js'
import type { FindableById } from '@/core/types/services.js'
import type { Result } from 'neverthrow'
import type {
	CREATE_LINK,
	Link,
	SharableLink,
	UPDATE_LINK,
} from '../schemas/index.js'

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

interface SharableLinksRepository {
	findOne: (id: string) => Promise<Maybe<SharableLink>>
	createOne: (userId: string, data: string[]) => Promise<string>
	acceptOne: (id: string, userId: string) => Promise<void>
	isAccepted: (id: string, userId: string) => Promise<boolean>
	setAccepted: (id: string, userId: string) => Promise<void>
}

interface SharableLinksService {
	findOne: (
		id: string,
	) => Promise<Result<SuccessResponse<SharableLink>, FailureResponse>>
	createOne: (
		userId: string,
		data: string[],
	) => Promise<SuccessResponse<{ id: string }>>
	acceptOne: (
		id: string,
		userId: string,
	) => Promise<Result<void, FailureResponse>>
}

interface LinksModuleDependencies {
	linksRepository: LinksRepository
	linksService: LinksService
	sharableLinksRepository: SharableLinksRepository
	sharableLinksService: SharableLinksService
}

type LinksInjectableDependencies =
	InjectableDependencies<LinksModuleDependencies>

type LinksDiConfig = BaseDiConfig<LinksModuleDependencies>

export type {
	LinksInjectableDependencies,
	LinksModuleDependencies,
	LinksRepository,
	LinksService,
	SharableLinksRepository,
	SharableLinksService,
	LinksDiConfig,
}
