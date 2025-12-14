import { asClass } from 'awilix'
import type { LinksDiConfig } from './types/index.js'
import { LinksRepositoryImpl } from './repositories/LinksRepository.js'
import { SharableLinksServiceImpl } from './services/SharableLinksService.js'
import { SharableLinkRepositoryImpl } from './repositories/SharableLinksRepository.js'

export const resolveLinksModule = (): LinksDiConfig => ({
	linksRepository: asClass(LinksRepositoryImpl).singleton(),
	linksService: asClass(LinksRepositoryImpl).singleton(),
	sharableLinksRepository: asClass(SharableLinkRepositoryImpl).singleton(),
	sharableLinksService: asClass(SharableLinksServiceImpl).singleton(),
})
