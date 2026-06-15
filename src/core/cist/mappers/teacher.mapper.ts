import { Teacher as CistTeacher } from '@mindenit/cist-crawler'
import { Teacher, TeacherSchema } from '../dtos'
import { Maybe } from 'src/common/utils/maybe'
import { EntityMapper } from 'src/core/entity.mapper'
import { Sorting } from 'src/common/utils/sorting'

// Types
type CistTeacherWithDepartment = CistTeacher & { departmentId: number }

export class TeacherMapper
	implements EntityMapper<CistTeacherWithDepartment, Teacher>
{
	schema = TeacherSchema

	toEntity(from: CistTeacherWithDepartment): Maybe.Maybe<Teacher> {
		const [fullName, shortName] = Sorting.byStringLength(
			from.full_name,
			from.short_name,
		)

		return Maybe.fromThrowable(() =>
			this.schema.parse({
				id: from.id,
				fullName,
				shortName,
				departmentId: from.departmentId,
			}),
		)
	}
}
