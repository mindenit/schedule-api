import type { DatabaseClient } from '@/core/types/deps.js'
import { academicGroupTable } from '@/db/schema/academic-group.js'
import { eventToAcademicGroupTable } from '@/db/schema/event-to-academic-group.js'
import { eventToTeacherTable } from '@/db/schema/event-to-teacher.js'
import { eventTable } from '@/db/schema/event.js'
import { subjectTable } from '@/db/schema/subject.js'
import { teacherTable } from '@/db/schema/teacher.js'
import type {
	Auditorium,
	Group,
	Schedule,
	Subject,
	Teacher,
} from '@/db/types.js'
import type { GET_SCHEDULE_OPTIONS } from '@/modules/schedule/schemas/index.js'
import {
	buildScheduleQuery,
	getFiltersQuery,
	getTimeIntervalQuery,
} from '@/modules/schedule/utils/index.js'
import { SQL, asc, eq, sql } from 'drizzle-orm'
import type {
	GroupsInjectableDependencies,
	GroupsRepository,
} from '../types/index.js'
import { auditoriumTable } from '@/db/schema/auditorium.js'

export class GroupsRepositoryImpl implements GroupsRepository {
	private readonly db: DatabaseClient

	constructor({ db }: GroupsInjectableDependencies) {
		this.db = db.client
	}

	async findAll(): Promise<Group[]> {
		return this.db
			.select()
			.from(academicGroupTable)
			.orderBy(asc(academicGroupTable.name))
	}

	async getAuditoriums(
		groupId: number,
	): Promise<Pick<Auditorium, 'id' | 'name'>[]> {
		return this.db
			.selectDistinct({
				id: auditoriumTable.id,
				name: auditoriumTable.name,
			})
			.from(eventTable)
			.innerJoin(
				eventToAcademicGroupTable,
				eq(eventTable.id, eventToAcademicGroupTable.eventId),
			)
			.innerJoin(
				auditoriumTable,
				eq(eventTable.auditoriumId, auditoriumTable.id),
			)
			.where(eq(eventToAcademicGroupTable.groudId, groupId))
			.orderBy(auditoriumTable.name)
	}

	async getSubjects(groupId: number): Promise<Subject[]> {
		return this.db
			.selectDistinct({
				id: subjectTable.id,
				name: subjectTable.name,
				brief: subjectTable.brief,
			})
			.from(eventTable)
			.innerJoin(
				eventToAcademicGroupTable,
				eq(eventTable.id, eventToAcademicGroupTable.eventId),
			)
			.innerJoin(subjectTable, eq(eventTable.subjectId, subjectTable.id))
			.where(eq(eventToAcademicGroupTable.groudId, groupId))
			.orderBy(subjectTable.brief)
	}

	async getTeachers(groupId: number): Promise<Omit<Teacher, 'departmentId'>[]> {
		return this.db
			.selectDistinct({
				id: teacherTable.id,
				shortName: teacherTable.shortName,
				fullName: teacherTable.fullName,
			})
			.from(eventTable)
			.innerJoin(
				eventToAcademicGroupTable,
				eq(eventTable.id, eventToAcademicGroupTable.eventId),
			)
			.innerJoin(
				eventToTeacherTable,
				eq(eventTable.id, eventToTeacherTable.eventId),
			)
			.innerJoin(
				teacherTable,
				eq(eventToTeacherTable.teacherId, teacherTable.id),
			)
			.where(eq(eventToAcademicGroupTable.groudId, groupId))
			.orderBy(teacherTable.shortName)
	}

	async getSchedule(options: GET_SCHEDULE_OPTIONS): Promise<Schedule[]> {
		const { id } = options

		const whereClause: SQL[] = [sql`ag1.id = ${id}`]

		const timeInterval = getTimeIntervalQuery(options)

		whereClause.push(...timeInterval)

		const filters = getFiltersQuery(options.filters)

		whereClause.push(...filters)

		const query = buildScheduleQuery(whereClause)

		const schedule = await this.db.execute(query)

		return schedule as unknown as Schedule[]
	}
}
