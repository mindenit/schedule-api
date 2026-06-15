import { createZodDto } from 'nestjs-zod'
import { PublicGroupSchema } from 'src/application/groups/groups.schema'
import { PublicTeacherSchema } from 'src/application/teachers/teachers.schemas'
import { GetByIdParamSchema } from 'src/common/schemas/params.schema'
import {
	getScheduleQuerySchema,
	ScheduleSchema,
} from 'src/common/schemas/schedule.schema'
import { AuditoriumSchema, SubjectSchema } from 'src/core/cist/dtos'

import { GetAuditoriumScheduleFiltersSchema } from '../auditoriums.schema'

export class AuditoriumsResponseDto extends createZodDto(
	AuditoriumSchema.array(),
) {}

export class GetAuditoriumParamsDto extends createZodDto(GetByIdParamSchema) {}

export class AuditoriumGroupsResponseDto extends createZodDto(
	PublicGroupSchema.array(),
) {}

export class AuditoriumSubjectsResponseDto extends createZodDto(
	SubjectSchema.array(),
) {}

export class AuditoriumTeachersResponseDto extends createZodDto(
	PublicTeacherSchema.array(),
) {}

export class AuditoriumsScheduleResponseDto extends createZodDto(
	ScheduleSchema.array(),
) {}

export class GetAuditoriumScheduleQueryDto extends createZodDto(
	getScheduleQuerySchema(GetAuditoriumScheduleFiltersSchema),
) {}
