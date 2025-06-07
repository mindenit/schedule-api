import { asClass } from 'awilix'
import type { EventsDiConfig } from './types/index.js'
import { EventsParserImpl } from './parsers/EventsParser.js'

export const resolveEventsModule = (): EventsDiConfig => ({
	eventsParser: asClass(EventsParserImpl).singleton(),
})
