import type { ScheduleType } from '@/core/constants/parsers.js'
import type { Maybe } from '@/core/types/common.js'
import type { BaseDiConfig, InjectableDependencies } from '@/core/types/deps.js'
import type { CistScheduleOutput } from '@/core/types/proxy.js'
import type { CistService } from '@/core/types/services.js'

interface EventsParser {
	parse: (id: number, type: ScheduleType) => Promise<Maybe<CistScheduleOutput>>
}

interface EventModuleDependencies {
	eventsParser: EventsParser
	eventsService: CistService<CistScheduleOutput>
}

type EventsInjectableDependencies =
	InjectableDependencies<EventModuleDependencies>
type EventsDiConfig = BaseDiConfig<EventModuleDependencies>

export type {
	EventModuleDependencies,
	EventsDiConfig,
	EventsParser,
	EventsInjectableDependencies,
}
