import { Direction as CistDirection } from '@mindenit/cist-crawler'
import { EntityMapper } from 'src/core/entity.mapper'
import { Direction, DirectionSchema } from '../dtos'
import { Maybe } from 'src/common/utils/maybe'
import { Sorting } from 'src/common/utils/sorting'

type CistDirectionWithFaculty = CistDirection & {
	facultyId: number
}

export class DirectionMapper
	implements EntityMapper<CistDirectionWithFaculty, Direction>
{
	schema = DirectionSchema

	toEntity(from: CistDirectionWithFaculty): Maybe.Maybe<Direction> {
		const [fullName, shortName] = Sorting.byStringLength(
			from.full_name,
			from.short_name,
		)

		return Maybe.fromThrowable(() => {
			return this.schema.parse({
				id: from.id,
				fullName,
				shortName,
				facultyId: from.facultyId,
			})
		})
	}
}
