import { Subject as CistSubject } from '@mindenit/cist-crawler'
import { Maybe } from 'src/common/utils/maybe'
import { EntityMapper } from 'src/core/entity.mapper'

import { Subject, SubjectSchema } from '../dtos'

export class SubjectMapper implements EntityMapper<CistSubject, Subject> {
	schema = SubjectSchema

	toEntity(from: CistSubject): Maybe.Maybe<Subject> {
		return Maybe.fromThrowable(() =>
			this.schema.parse({
				id: from.id,
				name: from.title,
				brief: from.brief,
			}),
		)
	}
}
