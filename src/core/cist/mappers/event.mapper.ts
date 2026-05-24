import { Event as CistEvent } from '@mindenit/cist-crawler'
import { Maybe } from 'src/common/utils/maybe'
import { EntityMapper } from 'src/core/entity.mapper'
import { Event, EventGroup, EventSchema, EventTeacher, Subject } from '../dtos'
import { cistTypeIdToEventType } from '../helpers/event-type.helper'

type EventMapperInput = {
	event: CistEvent
	subject: Subject
	teachers: EventTeacher[]
	groups: EventGroup[]
}

export class EventMapper implements EntityMapper<EventMapperInput, Event> {
	schema = EventSchema

	toEntity(from: EventMapperInput): Maybe.Maybe<Event> {
		const { event, subject, teachers, groups } = from

		return Maybe.fromThrowable(() =>
			this.schema.parse({
				numberPair: event.number_pair ?? 0,
				startedAt: event.start_time ?? 0,
				endedAt: event.end_time ?? 0,
				type: cistTypeIdToEventType(event.type),
				auditoriumName: event.auditory,
				subject,
				teachers,
				groups,
			}),
		)
	}
}
