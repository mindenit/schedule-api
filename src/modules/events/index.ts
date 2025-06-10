import { asClass } from 'awilix'
import type { EventsDiConfig } from './types/index.js'
import { EventsParserImpl } from './parsers/EventsParser.js'
import { EventsService } from './services/EventsService.js'

export const resolveEventsModule = (): EventsDiConfig => ({
	eventsParser: asClass(EventsParserImpl).singleton(),
	eventsService: asClass(EventsService).singleton(),
})
