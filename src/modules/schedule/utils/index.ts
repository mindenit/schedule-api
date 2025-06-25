import { sql, type SQL } from 'drizzle-orm'
import type { GET_SCHEDULE_QUERY } from '../schemas/index.js'

export const getTimeIntervalQuery = ({
	startedAt,
	endedAt,
}: GET_SCHEDULE_QUERY): SQL[] => {
	const clause: SQL[] = []

	if (startedAt) {
		clause.push(sql`and`, sql`e.started_at >= ${startedAt}`)
	}

	if (endedAt) {
		clause.push(sql`and`, sql`e.ended_at <= ${endedAt}`)
	}

	return clause
}

export const buildScheduleQuery = (whereClause: SQL[]): SQL<unknown> => {
	return sql`
    select
      e.id::int as id,
      e.number_pair as "numberPair",
      e.type as type,
      json_build_object('id', a.id, 'name', a.name) as auditorium,
      e.started_at as "startedAt",
      e.ended_at as "endedAt",
      jsonb_build_object('id', s.id, 'title', s.name, 'brief', s.brief) as subject,
      array_agg(jsonb_build_object('id', ag2.id, 'name', ag2.name)) as groups,
      coalesce(
        json_agg(
          jsonb_build_object(
            'id', t2.id,
            'shortName', t2.short_name,
            'fullName', t2.full_name
          )
        ) FILTER (WHERE t2.id IS NOT NULL),
        '[]'::json
      ) as teachers
    from
      event e
    join auditorium a on a.id = e.auditorium_id
    join subject s on s.id = e.subject_id
    join event_to_academic_group etag1 on etag1.event_id = e.id
    join academic_group ag1 on ag1.id = etag1.groud_id
    join event_to_academic_group etag2 on etag2.event_id = e.id
    join academic_group ag2 on ag2.id = etag2.groud_id
    left join event_to_teacher ett1 on ett1.event_id = e.id
    left join teacher t1 on t1.id = ett1.teacher_id
    left join event_to_teacher ett2 on ett2.event_id = e.id
    left join teacher t2 on t2.id = ett2.teacher_id
    where ${sql.join(whereClause, sql.raw(' '))}
    group by
      e.id, a.name, s.id, a.id
    order by
      e.started_at;
  `
}
