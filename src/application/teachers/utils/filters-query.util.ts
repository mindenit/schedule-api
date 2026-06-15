import { SQL } from 'drizzle-orm'
import { GetTeacherScheduleFilters } from '../teachers.schemas'
import {
	auditoriumIn,
	groupIn,
	lessonTypeIn,
	subjectIn,
} from 'src/common/utils/schedule/schedule'

export const getTeacherFiltersQuery = (
	filters: GetTeacherScheduleFilters,
): (SQL | undefined)[] => [
	auditoriumIn(filters.auditoriums),
	lessonTypeIn(filters.lessonTypes),
	groupIn(filters.groups),
	subjectIn(filters.subjects),
]
