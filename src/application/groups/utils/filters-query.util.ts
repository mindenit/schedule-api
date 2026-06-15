import { SQL } from 'drizzle-orm'
import {
	auditoriumIn,
	lessonTypeIn,
	subjectIn,
	teacherIn,
} from 'src/common/utils/schedule/schedule'

import { GetGroupScheduleFilters } from '../groups.schema'

export const getGroupFiltersQuery = (
	filters: GetGroupScheduleFilters,
): (SQL | undefined)[] => [
	auditoriumIn(filters.auditoriums),
	lessonTypeIn(filters.lessonTypes),
	teacherIn(filters.teachers),
	subjectIn(filters.subjects),
]
