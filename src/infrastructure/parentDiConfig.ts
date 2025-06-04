import type {
	CommonDependencies,
	ExternalDependencies,
} from '@/core/types/deps.js'
import type { AwilixContainer, NameAndRegistrationPair } from 'awilix'
import { resolveCommonDiConfig } from './commonDiConfig.js'

type Dependencies = CommonDependencies

type DiConfig = NameAndRegistrationPair<Dependencies>

export const registerDependencies = (
	diContainer: AwilixContainer,
	dependencies: ExternalDependencies,
) => {
	const diConfig: DiConfig = {
		...resolveCommonDiConfig(dependencies),
	}

	diContainer.register(diConfig)
}

declare module '@fastify/awilix' {
	// eslint-disable-next-line @typescript-eslint/no-empty-object-type
	interface Cradle extends Dependencies {}

	// eslint-disable-next-line @typescript-eslint/no-empty-object-type
	interface RequestCradle extends Dependencies {}
}
