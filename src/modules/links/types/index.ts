import type { InjectableDependencies } from '@/core/types/deps.js'
import type { CREATE_LINK, Link, UPDATE_LINK } from '../schemas/index.js'
import type { Creatable, FindableById } from '@/core/types/services.js'
import type { Maybe } from '@/core/types/common.js'

interface LinksRepository
	extends FindableById<Link, string, string>,
		Creatable<CREATE_LINK, Link> {
	findMany: (pattern: string) => Promise<Link[]>
	updateOne: (id: string, data: UPDATE_LINK) => Promise<void>
	deleteOne: (id: string, userId: string) => Promise<void>
}

interface SharableLinksRepository extends FindableById<Maybe<string>, string> {
	createOne: (userId: string, data: string[]) => Promise<string>
}

interface LinksModuleDependencies {
	linksRepository: LinksRepository
	sharableLinksRepository: SharableLinksRepository
}

type LinksInjectableDependencies =
	InjectableDependencies<LinksModuleDependencies>

export type {
	LinksRepository,
	LinksInjectableDependencies,
	SharableLinksRepository,
}
