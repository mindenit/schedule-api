import { AuditoryType } from '@mindenit/cist-crawler'
import { Maybe } from 'src/common/utils/maybe'
import {
	AuditoriumType,
	AuditoriumTypeSchema,
} from 'src/core/cist/dtos/auditorium.dto'
import { EntityMapper } from 'src/core/entity.mapper'

type AuditoryTypeWithAuditoryId = AuditoryType & { auditoriumId: string }

export class AuditoriumTypeMapper
	implements EntityMapper<AuditoryType, AuditoriumType>
{
	schema = AuditoriumTypeSchema

	toEntity(from: AuditoryTypeWithAuditoryId): Maybe.Maybe<AuditoriumType> {
		return Maybe.fromThrowable(() =>
			this.schema.parse({
				id: Number.parseInt(from.id),
				name: from.short_name,
				auditoriumId: Number.parseInt(from.auditoriumId),
			}),
		)
	}
}
