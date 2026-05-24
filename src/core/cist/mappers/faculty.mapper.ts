import { Faculty as CistFaculty } from '@mindenit/cist-crawler'
import { EntityMapper } from 'src/core/entity.mapper'
import { Faculty, FacultySchema } from '../dtos'
import { Maybe } from 'src/common/utils/maybe'

export class FacultyMapper implements EntityMapper<CistFaculty, Faculty> {
	schema = FacultySchema

	toEntity(from: CistFaculty): Maybe.Maybe<Faculty> {
		return Maybe.fromThrowable(() =>
			this.schema.parse({
				id: from.id,
				fullName: from.full_name,
				shortName: from.short_name,
			}),
		)
	}
}
