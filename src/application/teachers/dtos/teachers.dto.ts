import { createZodDto } from 'nestjs-zod'
import { GetByIdParamSchema } from 'src/common/schemas/params.schema'
import { getSuccessResponseSchema } from 'src/common/schemas/response.schema'
import {
	getScheduleQuerySchema,
	ScheduleSchema,
} from 'src/common/schemas/schedule.schema'
import {
	AuditoriumSchema,
	GroupSchema,
	SubjectSchema,
	TeacherSchema,
} from 'src/core/cist/dtos'

import { GetTeacherScheduleFiltersSchema } from '../teachers.schemas'

export class TeachersResponseDto extends createZodDto(
	getSuccessResponseSchema(TeacherSchema.array()),
) {}

export class GetTeacherParamsDto extends createZodDto(GetByIdParamSchema) {}

export class TeacherAuditoriumsResponseDto extends createZodDto(
	getSuccessResponseSchema(AuditoriumSchema.array()),
) {}

export class TeacherGroupsResponseDto extends createZodDto(
	getSuccessResponseSchema(GroupSchema.array()),
) {}

export class TeacherSubjectsResponseDto extends createZodDto(
	getSuccessResponseSchema(SubjectSchema.array()),
) {}

export class TeacherScheduleResponseDto extends createZodDto(
	getSuccessResponseSchema(ScheduleSchema.array()),
) {}

export class TeacherScheduleQueryDto extends createZodDto(
	getScheduleQuerySchema(GetTeacherScheduleFiltersSchema),
) {}
