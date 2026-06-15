import { SQL } from 'drizzle-orm'
import {
	groupIn,
	lessonTypeIn,
	subjectIn,
	teacherIn,
} from 'src/common/utils/schedule/schedule'
import { Auditorium } from 'src/core/cist/dtos'

import { GetAuditoriumScheduleFilters } from '../auditoriums.schema'

export const getAuditoriumFiltersQuery = (
	filters: GetAuditoriumScheduleFilters,
): (SQL | undefined)[] => [
	lessonTypeIn(filters.lessonTypes),
	teacherIn(filters.teachers),
	groupIn(filters.groups),
	subjectIn(filters.subjects),
]

export const isDLAuditorium = (auditorium: Auditorium | null): boolean => {
	return auditorium?.name.startsWith('DL') ?? false
}
