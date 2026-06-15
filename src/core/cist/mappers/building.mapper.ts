import { Building as CistBuilding } from '@mindenit/cist-crawler'
import { Maybe } from 'src/common/utils/maybe'
import { Sorting } from 'src/common/utils/sorting'
import { EntityMapper } from 'src/core/entity.mapper'

import { Building, BuildingSchema } from '../dtos'

export class BuildingMapper implements EntityMapper<CistBuilding, Building> {
	schema = BuildingSchema

	/*
	 * Maps building from Cist Crawler to the entity.
	 * @param {CistBuilding} from - the building from crawler.
	 * @returns {Maybe.Maybe<Building>} The building entity.
	 */
	toEntity(from: CistBuilding): Maybe.Maybe<Building> {
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
