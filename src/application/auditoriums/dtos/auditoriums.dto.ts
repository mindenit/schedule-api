import { createZodDto } from 'nestjs-zod'
import { GetByIdParamSchema } from 'src/common/schemas/params.schema'
import {
	AuditoriumSchema,
	GroupSchema,
	SubjectSchema,
	TeacherSchema,
} from 'src/core/cist/dtos'

export class AuditoriumsResponseDto extends createZodDto(
	AuditoriumSchema.array(),
) {}

export class GetAuditoriumParamsDto extends createZodDto(GetByIdParamSchema) {}

export class AuditoriumGroupsResponseDto extends createZodDto(
	GroupSchema.pick({ id: true, name: true }).array(),
) {}

export class AuditoriumSubjectsResponseDto extends createZodDto(
	SubjectSchema.array(),
) {}

export class AuditoriumTeachersResponseDto extends createZodDto(
	TeacherSchema.omit({ departmentId: true }).array(),
) {}
