import { Direction } from '@mindenit/cist-crawler'
import { Maybe } from 'src/common/utils/maybe'
import { EntityMapper } from 'src/core/entity.mapper'
import { Speciality, SpecialitySchema } from '../dtos'

type CistSpeciality = Omit<Direction, 'specialities'> & {
	directionId: number
}

export class SpecialityMapper
	implements EntityMapper<CistSpeciality, Speciality>
{
	schema = SpecialitySchema

	toEntity(from: CistSpeciality): Maybe.Maybe<Speciality> {
		return Maybe.fromThrowable(() => {
			return this.schema.parse({
				id: from.id,
				fullName: from.full_name,
				shortName: from.short_name,
				directionId: from.directionId,
			})
		})
	}
}
