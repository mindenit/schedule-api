import { Inject, Injectable } from '@nestjs/common'
import { asc, eq, getTableColumns } from 'drizzle-orm'
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { DATABASE_CONNECTION_TOKEN } from 'src/components/database/di-tokens'
import {
	subjectTable,
	academicGroupTable,
	auditoriumTable,
	eventTable,
	eventToAcademicGroupTable,
	eventToTeacherTable,
	teacherTable,
} from 'src/db/schema'
import { PublicAditorium } from '../auditoriums/auditoriums.schema'
import { PublicGroup } from '../groups/groups.schema'
import { PublicTeacher } from './teachers.schemas'
import { Subject } from 'src/core/cist/dtos'

@Injectable()
export class TeachersRepository {
	constructor(
		@Inject(DATABASE_CONNECTION_TOKEN)
		private readonly db: PostgresJsDatabase,
	) {}

	async findAll(): Promise<PublicTeacher[]> {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { departmentId, ...rest } = getTableColumns(teacherTable)

		return this.db
			.select(rest)
			.from(teacherTable)
			.orderBy(asc(teacherTable.shortName))
	}

	async findTeacherAuditoriums(teacherId: number): Promise<PublicAditorium[]> {
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

	async findTeacherGroups(teacherId: number): Promise<PublicGroup[]> {
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

	async findTeacherSubjects(teacherId: number): Promise<Subject[]> {
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
}
