import { QueryParamUtils } from 'src/common/utils/query-param'
import z from 'zod'

const GetAuditoriumScheduleFiltersSchema = z
	.object({
		lessonTypes: z
			.string()
			.nullable()
			.default(null)
			.transform(QueryParamUtils.transformEventTypes)
			.describe('Comma-separated list of lesson types. Example: "Лк,Пз"'),
		teachers: z
			.string()
			.nullable()
			.default(null)
			.transform(QueryParamUtils.transformIds)
			.describe(
				'Comma-separated list of teacher identifiers. Example: "1,2,3"',
			),
		groups: z
			.string()
			.nullable()
			.default(null)
			.transform(QueryParamUtils.transformIds)
			.describe(
				'Comma-separated list of group identifiers. Example: "101,102"',
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
		teachers: [],
		groups: [],
		subjects: [],
	})

type GetAuditoriumScheduleFilters = z.infer<
	typeof GetAuditoriumScheduleFiltersSchema
>

export { GetAuditoriumScheduleFiltersSchema }
export type { GetAuditoriumScheduleFilters }
