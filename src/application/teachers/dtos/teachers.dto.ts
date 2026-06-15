import { createZodDto } from 'nestjs-zod'
import { PublicAuditoriumSchema } from 'src/application/auditoriums/auditoriums.schema'
import { PublicGroupSchema } from 'src/application/groups/groups.schema'
import { GetByIdParamSchema } from 'src/common/schemas/params.schema'
import {
	getScheduleQuerySchema,
	ScheduleSchema,
} from 'src/common/schemas/schedule.schema'
import { SubjectSchema } from 'src/core/cist/dtos'

import {
	GetTeacherScheduleFiltersSchema,
	PublicTeacherSchema,
} from '../teachers.schemas'

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

export class TeacherScheduleResponseDto extends createZodDto(
	ScheduleSchema.array(),
) {}

export class TeacherScheduleQueryDto extends createZodDto(
	getScheduleQuerySchema(GetTeacherScheduleFiltersSchema),
) {}
