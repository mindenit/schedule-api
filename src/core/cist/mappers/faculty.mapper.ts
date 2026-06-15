import { Faculty as CistFaculty } from '@mindenit/cist-crawler'
import { EntityMapper } from 'src/core/entity.mapper'
import { Faculty, FacultySchema } from '../dtos'
import { Maybe } from 'src/common/utils/maybe'
import { Sorting } from 'src/common/utils/sorting'

export class FacultyMapper implements EntityMapper<CistFaculty, Faculty> {
	schema = FacultySchema

	toEntity(from: CistFaculty): Maybe.Maybe<Faculty> {
		const [fullName, shortName] = Sorting.byStringLength(
			from.full_name,
			from.short_name,
		)

		return Maybe.fromThrowable(() =>
			this.schema.parse({
				id: from.id,
				fullName,
				shortName,
			}),
		)
	}
}
