import { Department as CistDepartment } from '@mindenit/cist-crawler'
import { EntityMapper } from 'src/core/entity.mapper'
import { Maybe } from 'src/common/utils/maybe'
import { Department, DepartmentSchema } from '../dtos'

// Types
type CistDepartmentWithFaculty = CistDepartment & { facultyId: number }

export class DepartmentMapper
	implements EntityMapper<CistDepartmentWithFaculty, Department>
{
	schema = DepartmentSchema

	toEntity(from: CistDepartmentWithFaculty): Maybe.Maybe<Department> {
		return Maybe.fromThrowable(() =>
			this.schema.parse({
				id: from.id,
				shortName: from.short_name,
				fullName: from.full_name,
				facultyId: from.facultyId,
			}),
		)
	}
}
