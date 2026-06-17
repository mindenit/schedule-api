import { AuditoryElement } from '@mindenit/cist-crawler'
import { Maybe } from 'src/common/utils/maybe'
import {
	type Auditorium,
	AuditoriumSchema,
} from 'src/core/cist/dtos/auditorium.dto'
import { EntityMapper } from 'src/core/entity.mapper'

type AuditoryElementWithBuildingId = AuditoryElement & { buildingId: string }

export class AuditoriumMapper implements EntityMapper<
	AuditoryElementWithBuildingId,
	Auditorium
> {
	schema = AuditoriumSchema

	/*
	 * Maps auditorium from Cist Crawler to the entity.
	 * @param {AuditoryElementWithBuildingId} from - the auditorium from crawler with buildingId.
	 * @returns {Auditorium} The auditorium entity.
	 */
	toEntity(from: AuditoryElementWithBuildingId): Maybe.Maybe<Auditorium> {
		const { id, short_name, floor, is_have_power, buildingId } = from

		return Maybe.fromThrowable(() =>
			this.schema.parse({
				id: Number.parseInt(id),
				name: short_name,
				floor: Number.parseInt(floor),
				hasPower: Boolean(is_have_power),
				buildingId: buildingId,
			}),
		)
	}
}
