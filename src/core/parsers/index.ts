import { asClass } from 'awilix'
import type { BaseDiConfig } from '../types/deps.js'
import type { Parsers } from '../types/parsers.js'
import { AuditoriumParser } from './AuditoriumsParser.js'
import { GroupParser } from './GroupsParser.js'
import { TeachersParser } from './TeachersParser.js'
import { EventsParser } from './EventsParser.js'

export const resolveParsers = (): BaseDiConfig<Parsers> => ({
	auditoriumsParser: asClass(AuditoriumParser).singleton(),
	groupsParser: asClass(GroupParser).singleton(),
	teachersParser: asClass(TeachersParser).singleton(),
	eventsParser: asClass(EventsParser).singleton(),
})
