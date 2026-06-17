import { QueryParamUtils } from 'src/common/utils/query-param'
import { GroupSchema } from 'src/core/cist/dtos'
import z from 'zod'

const PublicGroupSchema = GroupSchema.pick({ id: true, name: true })

type PublicGroup = z.infer<typeof PublicGroupSchema>

const GetGroupScheduleFiltersSchema = z
	.object({
		lessonTypes: z
			.string()
			.nullable()
			.default(null)
			.transform(QueryParamUtils.transformEventTypes)
			.describe(
				'Comma-separated list of lesson types to filter by. Example: "Лк,Пз"',
			),
		teachers: z
			.string()
			.nullable()
			.default(null)
			.transform(QueryParamUtils.transformIds)
			.describe(
				'Comma-separated list of teacher IDs to filter by. Example: "1,2,3"',
			),
		auditoriums: z
			.string()
			.nullable()
			.default(null)
			.transform(QueryParamUtils.transformIds)
			.describe(
				'Comma-separated list of auditorium IDs to filter by. Example: "1,2,3"',
			),
		subjects: z
			.string()
			.nullable()
			.default(null)
			.transform(QueryParamUtils.transformIds)
			.describe(
				'Comma-separated list of subject IDs to filter by. Example: "1,2,3"',
			),
	})
	.default({
		lessonTypes: [],
		teachers: [],
		auditoriums: [],
		subjects: [],
	})

type GetGroupScheduleFilters = z.infer<typeof GetGroupScheduleFiltersSchema>

export { GetGroupScheduleFiltersSchema, PublicGroupSchema }
export type { GetGroupScheduleFilters, PublicGroup }
