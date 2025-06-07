import type { Auditorium, Group, Teacher } from '@/db/types.js'
import type { Maybe } from './common.js'
import type { ScheduleType } from '../constants/parsers.js'
import type { Event } from '@/db/types.js'

interface BaseParser<T extends object> {
	parse: () => Promise<Maybe<T>>
}

interface IEventsParser {
	parse: (id: number, type: ScheduleType) => Promise<Maybe<Event[]>>
}

interface Parsers {
	auditoriumsParser: BaseParser<Auditorium>
	groupsParser: BaseParser<Group>
	teachersParser: BaseParser<Teacher>
	eventsParser: IEventsParser
}

export type { BaseParser, Parsers, IEventsParser }
