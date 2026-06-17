import { Direction } from '@mindenit/cist-crawler'
import { Maybe } from 'src/common/utils/maybe'
import { Sorting } from 'src/common/utils/sorting'
import { EntityMapper } from 'src/core/entity.mapper'

import { Speciality, SpecialitySchema } from '../dtos'

type CistSpeciality = Omit<Direction, 'specialities'> & {
	directionId: number
}

export class SpecialityMapper implements EntityMapper<
	CistSpeciality,
	Speciality
> {
	schema = SpecialitySchema

	toEntity(from: CistSpeciality): Maybe.Maybe<Speciality> {
		const [fullName, shortName] = Sorting.byStringLength(
			from.full_name,
			from.short_name,
		)

		return Maybe.fromThrowable(() => {
			return this.schema.parse({
				id: from.id,
				fullName,
				shortName,
				directionId: from.directionId,
			})
		})
	}
}
