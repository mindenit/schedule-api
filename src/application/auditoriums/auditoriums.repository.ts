import { Inject, Injectable } from '@nestjs/common'
import { asc, eq, notLike } from 'drizzle-orm'
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { DATABASE_CONNECTION_TOKEN } from 'src/components/database/di-tokens'
import { Auditorium, Group, Subject, Teacher } from 'src/core/cist/dtos'
import {
	academicGroupTable,
	auditoriumTable,
	eventTable,
	eventToAcademicGroupTable,
	eventToTeacherTable,
	subjectTable,
	teacherTable,
} from 'src/db/schema'

@Injectable()
export class AuditoriumsRepository {
	constructor(
		@Inject(DATABASE_CONNECTION_TOKEN)
		private readonly db: PostgresJsDatabase,
	) {}

	async findAll(): Promise<Auditorium[]> {
		return this.db
			.select()
			.from(auditoriumTable)
			.where(notLike(auditoriumTable.name, 'DL%'))
			.orderBy(asc(auditoriumTable.name))
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
}
