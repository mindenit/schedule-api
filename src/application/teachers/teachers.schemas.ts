import { QueryParamUtils } from 'src/common/utils/query-param'
import z from 'zod'

const GetTeacherScheduleFiltersSchema = z
	.object({
		lessonTypes: z
			.string()
			.nullable()
			.default(null)
			.transform(QueryParamUtils.transformEventTypes)
			.describe('Comma-separated list of lesson types. Example: "Лк,Пз"'),
		groups: z
			.string()
			.nullable()
			.default(null)
			.transform(QueryParamUtils.transformIds)
			.describe('Comma-separated list of group identifiers. Example: "1,2,3"'),
		auditoriums: z
			.string()
			.nullable()
			.default(null)
			.transform(QueryParamUtils.transformIds)
			.describe(
				'Comma-separated list of auditorium identifiers. Example: "101,102"',
			),
		subjects: z
			.string()
			.nullable()
			.default(null)
			.transform(QueryParamUtils.transformIds)
			.describe(
				'Comma-separated list of subject identifiers. Example: "1,2,3"',
			),
	})
	.default({
		lessonTypes: [],
		groups: [],
		auditoriums: [],
		subjects: [],
	})

type GetTeacherScheduleFilters = z.infer<typeof GetTeacherScheduleFiltersSchema>

export { GetTeacherScheduleFiltersSchema }
export type { GetTeacherScheduleFilters }
