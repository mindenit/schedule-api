import { createZodDto } from 'nestjs-zod'
import { PublicTeacherSchema } from '../teachers.schemas'
import { GetByIdParamSchema } from 'src/common/schemas/params.schema'
import { PublicAuditoriumSchema } from 'src/application/auditoriums/auditoriums.schema'
import { PublicGroupSchema } from 'src/application/groups/groups.schema'
import { SubjectSchema } from 'src/core/cist/dtos'

export class TeachersResponseDto extends createZodDto(
	PublicTeacherSchema.array(),
) {}

export class GetTeacherParamsDto extends createZodDto(GetByIdParamSchema) {}

export class TeacherAuditoriumsResponseDto extends createZodDto(
	PublicAuditoriumSchema.array(),
) {}

export class TeacherGroupsResponseDto extends createZodDto(
	PublicGroupSchema.array(),
) {}

export class TeacherSubjectsResponseDto extends createZodDto(
	SubjectSchema.array(),
) {}
