import { sql, type SQL } from 'drizzle-orm'
import type { GET_TEACHER_SCHEDULE_FILTERS } from '../schemas/index.js'

export const getTeacherFiltersQuery = (
	filters: GET_TEACHER_SCHEDULE_FILTERS,
): SQL[] => {
	const clause: SQL[] = []
	const { auditoriums, lessonTypes, groups, subjects } = filters

	if (auditoriums.length) {
		clause.push(sql`and`, sql`a.id in (${sql.join(auditoriums, sql`,`)})`)
	}

	if (lessonTypes.length) {
		clause.push(sql`and`, sql`e.type in (${sql.join(lessonTypes, sql`,`)})`)
	}

	if (groups.length) {
		clause.push(sql`and`, sql`ag2.id in (${sql.join(groups, sql`,`)})`)
	}

	if (subjects.length) {
		clause.push(sql`and`, sql`s.id in (${sql.join(subjects, sql`,`)})`)
	}

	return clause
}
