import { Group as CistGroup } from '@mindenit/cist-crawler'
import { Maybe } from 'src/common/utils/maybe'
import { Group, GroupSchema } from 'src/core/cist/dtos/group.dto'
import { EntityMapper } from 'src/core/entity.mapper'

type CistGroupWithSpecialityOrDirection = CistGroup & {
	specialityId: number | null
	directionId: number | null
}

export class GroupMapper
	implements EntityMapper<CistGroupWithSpecialityOrDirection, Group>
{
	schema = GroupSchema

	toEntity(from: CistGroupWithSpecialityOrDirection): Maybe.Maybe<Group> {
		return Maybe.fromThrowable(() => this.schema.parse(from))
	}
}
