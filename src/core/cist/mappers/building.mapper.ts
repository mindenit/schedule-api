import { EntityMapper } from 'src/core/entity.mapper'
import { Building as CistBuilding } from '@mindenit/cist-crawler'
import { Maybe } from 'src/common/utils/maybe'
import { Building, BuildingSchema } from '../dtos'

export class BuildingMapper implements EntityMapper<CistBuilding, Building> {
	schema = BuildingSchema

	/*
	 * Maps building from Cist Crawler to the entity.
	 * @param {CistBuilding} from - the building from crawler.
	 * @returns {Maybe.Maybe<Building>} The building entity.
	 */
	toEntity(from: CistBuilding): Maybe.Maybe<Building> {
		return Maybe.fromThrowable(() =>
			this.schema.parse({
				id: from.id,
				fullName: from.full_name,
				shortName: from.short_name,
			}),
		)
	}
}
