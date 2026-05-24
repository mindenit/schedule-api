import { Teacher as CistTeacher } from '@mindenit/cist-crawler'
import { Teacher, TeacherSchema } from '../dtos'
import { Maybe } from 'src/common/utils/maybe'
import { EntityMapper } from 'src/core/entity.mapper'

// Types
type CistTeacherWithDepartment = CistTeacher & { departmentId: number }

export class TeacherMapper
	implements EntityMapper<CistTeacherWithDepartment, Teacher>
{
	schema = TeacherSchema

	toEntity(from: CistTeacherWithDepartment): Maybe.Maybe<Teacher> {
		return Maybe.fromThrowable(() =>
			this.schema.parse({
				id: from.id,
				fullName: from.full_name,
				shortName: from.short_name,
				departmentId: from.departmentId,
			}),
		)
	}
}
