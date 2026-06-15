import { Hour as CistHour } from '@mindenit/cist-crawler'
import { Maybe } from 'src/common/utils/maybe'
import { EntityMapper } from 'src/core/entity.mapper'

import { SubjectHour, SubjectHourSchema } from '../dtos'
import { cistTypeIdToEventType } from '../helpers/event-type.helper'

type CistHourWithSubjectId = CistHour & { subjectId: number }

export class SubjectHourMapper
	implements EntityMapper<CistHourWithSubjectId, SubjectHour>
{
	schema = SubjectHourSchema

	toEntity(from: CistHourWithSubjectId): Maybe.Maybe<SubjectHour> {
		return Maybe.fromThrowable(() =>
			this.schema.parse({
				subjectId: from.subjectId,
				hours: from.val,
				type: cistTypeIdToEventType(from.type),
				teacherId: from.teachers[0] ?? null,
			}),
		)
	}
}
