import { createZodDto } from 'nestjs-zod'
import { PublicAuditoriumSchema } from 'src/application/auditoriums/auditoriums.schema'
import { PublicTeacherSchema } from 'src/application/teachers/teachers.schemas'
import { GetByIdParamSchema } from 'src/common/schemas/params.schema'
import {
	getScheduleQuerySchema,
	ScheduleSchema,
} from 'src/common/schemas/schedule.schema'
import { GroupSchema, SubjectSchema } from 'src/core/cist/dtos'
import { GetGroupScheduleFiltersSchema } from '../groups.schema'

export class GroupsResponseDto extends createZodDto(GroupSchema.array()) {}

export class GetGroupParamsDto extends createZodDto(GetByIdParamSchema) {}

export class GroupAuditoriumsResponseDto extends createZodDto(
	PublicAuditoriumSchema.array(),
) {}

export class GroupSubjectsResponseDto extends createZodDto(
	SubjectSchema.array(),
) {}

export class GroupTeachersResponseDto extends createZodDto(
	PublicTeacherSchema.array(),
) {}

export class GroupScheduleResponseDto extends createZodDto(
	ScheduleSchema.array(),
) {}

export class GroupScheduleQueryDto extends createZodDto(
	getScheduleQuerySchema(GetGroupScheduleFiltersSchema),
) {}
