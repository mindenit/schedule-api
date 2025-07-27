import type { Maybe } from '@/core/types/common.js'
import type { Auditorium } from '@/db/types.js'
import { sql, type SQL } from 'drizzle-orm'
import type { GET_AUDITORIUM_SCHEDULE_FILTERS } from '../schemas/index.js'

export const getAuditoriumFiltersQuery = (
	filters: GET_AUDITORIUM_SCHEDULE_FILTERS,
): SQL[] => {
	const clause: SQL[] = []
	const { lessonTypes, teachers, groups, subjects } = filters

	if (lessonTypes.length) {
		clause.push(sql`and`, sql`e.type in (${sql.join(lessonTypes, sql`,`)})`)
	}

	if (teachers.length) {
		clause.push(sql`and`, sql`t2.id in (${sql.join(teachers, sql`,`)})`)
	}

	if (groups.length) {
		clause.push(sql`and`, sql`ag2.id in (${sql.join(groups, sql`,`)})`)
	}

	if (subjects.length) {
		clause.push(sql`and`, sql`s.id in (${sql.join(subjects, sql`,`)})`)
	}

	return clause
}

export const isDLAuditorium = (auditorium: Maybe<Auditorium>): boolean => {
	return auditorium?.name.startsWith('DL') ?? false
}
