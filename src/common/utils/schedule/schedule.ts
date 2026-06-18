import { and, eq, exists, gte, inArray, lte, type SQL, sql } from 'drizzle-orm'
import { alias, PgColumn, PgTable, QueryBuilder } from 'drizzle-orm/pg-core'
import {
	academicGroupTable,
	auditoriumTable,
	eventTable,
	eventToAcademicGroupTable,
	eventToTeacherTable,
	eventTypeEnum,
	subjectTable,
} from 'src/db/schema'

export interface TimeInterval {
	startedAt: number | null
	endedAt: number | null
}

type LessonType = (typeof eventTypeEnum.enumValues)[number]

export const scheduleAliases = {
	e: alias(eventTable, 'e'),
	a: alias(auditoriumTable, 'a'),
	s: alias(subjectTable, 's'),
	ag1: alias(academicGroupTable, 'ag1'),
	ett1: alias(eventToTeacherTable, 'ett1'),
}

const relationExists = ({
	table,
	eventId,
	target,
	values,
}: {
	table: PgTable
	eventId: PgColumn
	target: PgColumn
	values: readonly number[]
}): SQL | undefined => {
	const qb = new QueryBuilder()

	return values.length
		? exists(
				qb
					.select({ n: sql`1` })
					.from(table)
					.where(
						and(
							eq(eventId, scheduleAliases.e.id),
							inArray(target, [...values]),
						),
					),
			)
		: undefined
}

export const auditoriumIn = (ids: number[]): SQL | undefined =>
	ids.length ? inArray(scheduleAliases.a.id, ids) : undefined

export const subjectIn = (ids: number[]): SQL | undefined =>
	ids.length ? inArray(scheduleAliases.s.id, ids) : undefined

export const lessonTypeIn = (types: string[]): SQL | undefined =>
	types.length
		? inArray(scheduleAliases.e.type, types as LessonType[])
		: undefined

export const teacherIn = (ids: number[]): SQL | undefined =>
	relationExists({
		table: eventToTeacherTable,
		eventId: eventToTeacherTable.eventId,
		target: eventToTeacherTable.teacherId,
		values: ids,
	})

export const groupIn = (ids: number[]): SQL | undefined =>
	relationExists({
		table: eventToAcademicGroupTable,
		eventId: eventToAcademicGroupTable.eventId,
		target: eventToAcademicGroupTable.groudId,
		values: ids,
	})

export const getTimeIntervalConditions = ({
	startedAt,
	endedAt,
}: TimeInterval): (SQL | undefined)[] => [
	startedAt ? gte(scheduleAliases.e.startedAt, startedAt) : undefined,
	endedAt ? lte(scheduleAliases.e.endedAt, endedAt) : undefined,
]

export const buildScheduleQuery = (where: SQL): SQL<unknown> => {
	return sql`
    with scoped_events as (
      select distinct e.id as event_id
      from
        event e
      join auditorium a on a.id = e.auditorium_id
      join subject s on s.id = e.subject_id
      join event_to_academic_group etag1 on etag1.event_id = e.id
      join academic_group ag1 on ag1.id = etag1.groud_id
      left join event_to_teacher ett1 on ett1.event_id = e.id
      left join teacher t1 on t1.id = ett1.teacher_id
      where ${where}
    )
    select
      e.id::int as id,
      e.number_pair as "numberPair",
      e.type as type,
      json_build_object('id', a.id, 'name', a.name) as auditorium,
      e.started_at as "startedAt",
      e.ended_at as "endedAt",
      jsonb_build_object('id', s.id, 'title', s.name, 'brief', s.brief) as subject,
      g.groups,
      t.teachers,
      row_number() over (
        partition by s.id, e.type
        order by e.started_at, e.id
      )::int as "pairIndex",
      count(*) over (partition by s.id, e.type)::int as "pairsCount"
    from
      event e
    join scoped_events se on se.event_id = e.id
    join auditorium a on a.id = e.auditorium_id
    join subject s on s.id = e.subject_id
    left join lateral (
      select array_agg(jsonb_build_object('id', ag.id, 'name', ag.name)) as groups
      from event_to_academic_group etag
      join academic_group ag on ag.id = etag.groud_id
      where etag.event_id = e.id
    ) g on true
    left join lateral (
      select coalesce(
        json_agg(
          jsonb_build_object(
            'id', tt.id,
            'shortName', tt.short_name,
            'fullName', tt.full_name
          )
        ),
        '[]'::json
      ) as teachers
      from event_to_teacher ett
      join teacher tt on tt.id = ett.teacher_id
      where ett.event_id = e.id
    ) t on true
    order by
      e.started_at;
  `
}
