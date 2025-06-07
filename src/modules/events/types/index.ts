import type { ScheduleType } from '@/core/constants/parsers.js'
import type { Maybe } from '@/core/types/common.js'
import type { BaseDiConfig } from '@/core/types/deps.js'
import type { Event } from '@/db/types.js'

interface EventsParser {
	parse: (id: number, type: ScheduleType) => Promise<Maybe<Event[]>>
}

interface EventModuleDependencies {
	eventsParser: EventsParser
}

type EventsDiConfig = BaseDiConfig<EventModuleDependencies>

export type { EventsParser, EventModuleDependencies, EventsDiConfig }
