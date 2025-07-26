import type { DatabaseClient } from '@/core/types/deps.js'
import type {
	TeachersInjectableDependencies,
	TeachersRepository,
} from '../types/index.js'
import type { Group, Schedule, Teacher, Subject } from '@/db/types.js'
import { teacherTable } from '@/db/schema/teacher.js'
import { SQL, asc, sql, eq } from 'drizzle-orm'
import type { GET_SCHEDULE_OPTIONS } from '@/modules/schedule/schemas/index.js'
import {
	buildScheduleQuery,
	getFiltersQuery,
	getTimeIntervalQuery,
} from '@/modules/schedule/utils/index.js'
import {
	academicGroupTable,
	auditoriumTable,
	eventTable,
	eventToAcademicGroupTable,
	eventToTeacherTable,
	subjectTable,
} from '@/db/schema/index.js'

export class TeachersRepositoryImpl implements TeachersRepository {
	private readonly db: DatabaseClient

	constructor({ db }: TeachersInjectableDependencies) {
		this.db = db.client
	}

	async findAll(): Promise<Teacher[]> {
		return this.db
			.select()
			.from(teacherTable)
			.orderBy(asc(teacherTable.shortName))
	}

	async getAuditoriums(
		teacherId: number,
	): Promise<Pick<Group, 'id' | 'name'>[]> {
		return this.db
			.selectDistinct({
				id: auditoriumTable.id,
				name: auditoriumTable.name,
			})
			.from(eventTable)
			.innerJoin(
				eventToTeacherTable,
				eq(eventTable.id, eventToTeacherTable.eventId),
			)
			.innerJoin(
				auditoriumTable,
				eq(auditoriumTable.id, eventTable.auditoriumId),
			)
			.where(eq(eventToTeacherTable.teacherId, teacherId))
			.orderBy(auditoriumTable.name)
	}

	async getGroups(teacherId: number): Promise<Pick<Group, 'id' | 'name'>[]> {
		return this.db
			.selectDistinct({
				id: academicGroupTable.id,
				name: academicGroupTable.name,
			})
			.from(eventTable)
			.innerJoin(
				eventToTeacherTable,
				eq(eventTable.id, eventToTeacherTable.eventId),
			)
			.innerJoin(
				eventToAcademicGroupTable,
				eq(eventTable.id, eventToAcademicGroupTable.eventId),
			)
			.innerJoin(
				academicGroupTable,
				eq(eventToAcademicGroupTable.groudId, academicGroupTable.id),
			)
			.where(eq(eventToTeacherTable.teacherId, teacherId))
			.orderBy(academicGroupTable.name)
	}

	async getSubjects(teacherId: number): Promise<Subject[]> {
		return this.db
			.selectDistinct({
				id: subjectTable.id,
				name: subjectTable.name,
				brief: subjectTable.brief,
			})
			.from(eventTable)
			.innerJoin(
				eventToTeacherTable,
				eq(eventTable.id, eventToTeacherTable.eventId),
			)
			.innerJoin(subjectTable, eq(eventTable.subjectId, subjectTable.id))
			.where(eq(eventToTeacherTable.teacherId, teacherId))
			.orderBy(subjectTable.brief)
	}

	async getSchedule(options: GET_SCHEDULE_OPTIONS): Promise<Schedule[]> {
		const { id } = options

		const whereClause: SQL[] = [sql`ett1.teacher_id = ${id}`]

		const timeInterval = getTimeIntervalQuery(options)

		whereClause.push(...timeInterval)

		const filters = getFiltersQuery(options.filters)

		whereClause.push(...filters)

		const query = buildScheduleQuery(whereClause)

		const schedule = await this.db.execute(query)

		return schedule as unknown as Schedule[]
	}
}
