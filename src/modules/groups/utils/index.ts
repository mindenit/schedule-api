import { sql, type SQL } from 'drizzle-orm'
import type { GET_GROUP_SCHEDULE_FILTERS } from '../schemas/index.js'

export const getGroupFiltersQuery = (
	filters: GET_GROUP_SCHEDULE_FILTERS,
): SQL[] => {
	const clause: SQL[] = []
	const { auditoriums, lessonTypes, teachers, subjects } = filters

	if (auditoriums.length) {
		clause.push(sql`and`, sql`a.id in (${auditoriums.join(',')})`)
	}

	if (lessonTypes.length) {
		clause.push(sql`and`, sql`e.type in (${sql.join(lessonTypes, sql`,`)})`)
	}

	if (teachers.length) {
		clause.push(sql`and`, sql`t2.id in (${teachers.join(',')})`)
	}

	if (subjects.length) {
		clause.push(sql`and`, sql`s.id in (${subjects.join(',')})`)
	}

	return clause
}
