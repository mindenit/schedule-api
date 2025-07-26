import type { DatabaseClient } from '@/core/types/deps.js'
import type {
	AuditoriumsInjectableDependencies,
	AuditoriumsRepository,
} from '../types/index.js'
import type {
	Auditorium,
	Group,
	Schedule,
	Subject,
	Teacher,
} from '@/db/types.js'
import { auditoriumTable } from '@/db/schema/auditorium.js'
import { SQL, asc, sql, notLike, eq } from 'drizzle-orm'
import type { GET_SCHEDULE_OPTIONS } from '@/modules/schedule/schemas/index.js'

import {
	buildScheduleQuery,
	getFiltersQuery,
	getTimeIntervalQuery,
} from '@/modules/schedule/utils/index.js'
import type { Maybe } from '@/core/types/index.js'
import { academicGroupTable } from '@/db/schema/academic-group.js'
import { eventTable } from '@/db/schema/event.js'
import { eventToAcademicGroupTable } from '@/db/schema/event-to-academic-group.js'
import { teacherTable } from '@/db/schema/teacher.js'
import { eventToTeacherTable } from '@/db/schema/event-to-teacher.js'
import { subjectTable } from '@/db/schema/subject.js'

export class AuditoriumsRepositoryImpl implements AuditoriumsRepository {
	private readonly db: DatabaseClient

	constructor({ db }: AuditoriumsInjectableDependencies) {
		this.db = db.client
	}

	async findAll(): Promise<Auditorium[]> {
		return this.db
			.select()
			.from(auditoriumTable)
			.where(notLike(auditoriumTable.name, 'DL%'))
			.orderBy(asc(auditoriumTable.name))
	}

	async findOne(id: number): Promise<Maybe<Auditorium>> {
		const [auditorium] = await this.db
			.select()
			.from(auditoriumTable)
			.where(eq(auditoriumTable.id, id))

		return auditorium ?? null
	}

	async getGroups(auditoriumId: number): Promise<Pick<Group, 'id' | 'name'>[]> {
		return this.db
			.selectDistinct({
				id: academicGroupTable.id,
				name: academicGroupTable.name,
			})
			.from(eventTable)
			.innerJoin(
				eventToAcademicGroupTable,
				eq(eventTable.id, eventToAcademicGroupTable.eventId),
			)
			.innerJoin(
				academicGroupTable,
				eq(eventToAcademicGroupTable.groudId, academicGroupTable.id),
			)
			.where(eq(eventTable.auditoriumId, auditoriumId))
			.orderBy(asc(academicGroupTable.name))
	}

	async getTeachers(
		auditoriumId: number,
	): Promise<Omit<Teacher, 'departmentId'>[]> {
		return this.db
			.selectDistinct({
				id: teacherTable.id,
				shortName: teacherTable.shortName,
				fullName: teacherTable.fullName,
			})
			.from(eventTable)
			.innerJoin(
				eventToTeacherTable,
				eq(eventTable.id, eventToTeacherTable.eventId),
			)
			.innerJoin(
				teacherTable,
				eq(eventToTeacherTable.teacherId, teacherTable.id),
			)
			.where(eq(eventTable.auditoriumId, auditoriumId))
			.orderBy(asc(teacherTable.shortName))
	}

	async getSubjects(auditoriumId: number): Promise<Subject[]> {
		return this.db
			.selectDistinct({
				id: subjectTable.id,
				name: subjectTable.name,
				brief: subjectTable.brief,
			})
			.from(eventTable)
			.innerJoin(subjectTable, eq(eventTable.subjectId, subjectTable.id))
			.where(eq(eventTable.auditoriumId, auditoriumId))
			.orderBy(asc(subjectTable.brief))
	}

	async getSchedule(options: GET_SCHEDULE_OPTIONS): Promise<Schedule[]> {
		const { id } = options

		const whereClause: SQL[] = [sql`e.auditorium_id = ${id}`]

		const timeInterval = getTimeIntervalQuery(options)

		whereClause.push(...timeInterval)

		const filters = getFiltersQuery(options.filters)

		whereClause.push(...filters)

		const query = buildScheduleQuery(whereClause)

		const schedule = await this.db.execute(query)

		return schedule as unknown as Schedule[]
	}
}
