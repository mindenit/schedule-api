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

import { GetAuditoriumScheduleFiltersSchema } from '../auditoriums.schema'

export class AuditoriumsResponseDto extends createZodDto(
	getSuccessResponseSchema(AuditoriumSchema.array()),
) {}

export class GetAuditoriumParamsDto extends createZodDto(GetByIdParamSchema) {}

export class AuditoriumGroupsResponseDto extends createZodDto(
	getSuccessResponseSchema(GroupSchema.array()),
) {}

export class AuditoriumSubjectsResponseDto extends createZodDto(
	getSuccessResponseSchema(SubjectSchema.array()),
) {}

export class AuditoriumTeachersResponseDto extends createZodDto(
	getSuccessResponseSchema(TeacherSchema.array()),
) {}

export class AuditoriumsScheduleResponseDto extends createZodDto(
	getSuccessResponseSchema(ScheduleSchema.array()),
) {}

export class GetAuditoriumScheduleQueryDto extends createZodDto(
	getScheduleQuerySchema(GetAuditoriumScheduleFiltersSchema),
) {}
