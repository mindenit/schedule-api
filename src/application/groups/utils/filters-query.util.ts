import { SQL } from 'drizzle-orm'
import { GetGroupScheduleFilters } from '../groups.schema'
import {
	auditoriumIn,
	lessonTypeIn,
	subjectIn,
	teacherIn,
} from 'src/common/utils/schedule/schedule'

export const getGroupFiltersQuery = (
	filters: GetGroupScheduleFilters,
): (SQL | undefined)[] => [
	auditoriumIn(filters.auditoriums),
	lessonTypeIn(filters.lessonTypes),
	teacherIn(filters.teachers),
	subjectIn(filters.subjects),
]
