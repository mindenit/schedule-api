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

import { GetGroupScheduleFiltersSchema } from '../groups.schema'

export class GroupsResponseDto extends createZodDto(
	getSuccessResponseSchema(GroupSchema.array()),
) {}

export class GetGroupParamsDto extends createZodDto(GetByIdParamSchema) {}

export class GroupAuditoriumsResponseDto extends createZodDto(
	getSuccessResponseSchema(AuditoriumSchema.array()),
) {}

export class GroupSubjectsResponseDto extends createZodDto(
	getSuccessResponseSchema(SubjectSchema.array()),
) {}

export class GroupTeachersResponseDto extends createZodDto(
	getSuccessResponseSchema(TeacherSchema.array()),
) {}

export class GroupScheduleResponseDto extends createZodDto(
	getSuccessResponseSchema(ScheduleSchema.array()),
) {}

export class GroupScheduleQueryDto extends createZodDto(
	getScheduleQuerySchema(GetGroupScheduleFiltersSchema),
) {}
