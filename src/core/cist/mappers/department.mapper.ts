import { Department as CistDepartment } from '@mindenit/cist-crawler'
import { EntityMapper } from 'src/core/entity.mapper'
import { Maybe } from 'src/common/utils/maybe'
import { Department, DepartmentSchema } from '../dtos'
import { Sorting } from 'src/common/utils/sorting'

// Types
type CistDepartmentWithFaculty = CistDepartment & { facultyId: number }

export class DepartmentMapper
	implements EntityMapper<CistDepartmentWithFaculty, Department>
{
	schema = DepartmentSchema

	toEntity(from: CistDepartmentWithFaculty): Maybe.Maybe<Department> {
		const [fullName, shortName] = Sorting.byStringLength(
			from.full_name,
			from.short_name,
		)

		return Maybe.fromThrowable(() =>
			this.schema.parse({
				id: from.id,
				shortName,
				fullName,
				facultyId: from.facultyId,
			}),
		)
	}
}
