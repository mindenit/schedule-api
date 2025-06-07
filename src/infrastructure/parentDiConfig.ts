import type {
	CommonDependencies,
	ExternalDependencies,
} from '@/core/types/deps.js'
import type { AwilixContainer, NameAndRegistrationPair } from 'awilix'
import { resolveCommonDiConfig } from './commonDiConfig.js'
import type { AuditoriumsModuleDependencies } from '@/modules/auditoriums/types/index.js'
import { resolveAuditoriumsModule } from '@/modules/auditoriums/index.js'
import type { GroupsModuleDependencies } from '@/modules/groups/types/index.js'
import { resolveGroupsModule } from '@/modules/groups/index.js'
import type { TeachersModuleDependencies } from '@/modules/teachers/types/index.js'
import { resolveTeachersModule } from '@/modules/teachers/index.js'
import type { EventModuleDependencies } from '@/modules/events/types/index.js'
import { resolveEventsModule } from '@/modules/events/index.js'

type Dependencies = CommonDependencies &
	AuditoriumsModuleDependencies &
	GroupsModuleDependencies &
	EventModuleDependencies &
	TeachersModuleDependencies

type DiConfig = NameAndRegistrationPair<Dependencies>

export const registerDependencies = (
	diContainer: AwilixContainer,
	dependencies: ExternalDependencies,
) => {
	const diConfig: DiConfig = {
		...resolveCommonDiConfig(dependencies),
		...resolveAuditoriumsModule(),
		...resolveGroupsModule(),
		...resolveTeachersModule(),
		...resolveEventsModule(),
	}

	diContainer.register(diConfig)
}

declare module '@fastify/awilix' {
	// eslint-disable-next-line @typescript-eslint/no-empty-object-type
	interface Cradle extends Dependencies {}

	// eslint-disable-next-line @typescript-eslint/no-empty-object-type
	interface RequestCradle extends Dependencies {}
}
