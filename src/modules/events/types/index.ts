import type { ScheduleType } from '@/core/constants/parsers.js'
import type { Maybe } from '@/core/types/common.js'
import type { BaseDiConfig, InjectableDependencies } from '@/core/types/deps.js'
import type { CistScheduleOutput } from '@/core/types/proxy.js'

interface EventsParser {
	parse: (id: number, type: ScheduleType) => Promise<Maybe<CistScheduleOutput>>
}

interface EventsProcessor {
	process: (id: number, type: ScheduleType) => Promise<void>
	removeExtraEvents: () => Promise<void>
}

interface EventModuleDependencies {
	eventsParser: EventsParser
	eventsProcessor: EventsProcessor
}

type EventsInjectableDependencies =
	InjectableDependencies<EventModuleDependencies>
type EventsDiConfig = BaseDiConfig<EventModuleDependencies>

export type {
	EventModuleDependencies,
	EventsDiConfig,
	EventsInjectableDependencies,
	EventsParser,
	EventsProcessor,
}
