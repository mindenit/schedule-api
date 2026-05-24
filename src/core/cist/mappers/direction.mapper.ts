import { Direction as CistDirection } from '@mindenit/cist-crawler'
import { EntityMapper } from 'src/core/entity.mapper'
import { Direction, DirectionSchema } from '../dtos'
import { Maybe } from 'src/common/utils/maybe'

type CistDirectionWithFaculty = CistDirection & {
	facultyId: number
}

export class DirectionMapper
	implements EntityMapper<CistDirectionWithFaculty, Direction>
{
	schema = DirectionSchema

	toEntity(from: CistDirectionWithFaculty): Maybe.Maybe<Direction> {
		return Maybe.fromThrowable(() => {
			return this.schema.parse({
				id: from.id,
				fullName: from.full_name,
				shortName: from.short_name,
				facultyId: from.facultyId,
			})
		})
	}
}
