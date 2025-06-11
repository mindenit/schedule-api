import { asClass } from 'awilix'
import type { EventsDiConfig } from './types/index.js'
import { EventsParserImpl } from './parsers/EventsParser.js'
import { EventsProcessorImpl } from './processors/EventsProcessor.js'

export const resolveEventsModule = (): EventsDiConfig => ({
	eventsParser: asClass(EventsParserImpl).singleton(),
	eventsProcessor: asClass(EventsProcessorImpl).singleton(),
})
