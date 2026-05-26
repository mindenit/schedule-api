import { Inject, Injectable } from '@nestjs/common'
import { asc, eq } from 'drizzle-orm'
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { DATABASE_CONNECTION_TOKEN } from 'src/components/database/di-tokens'
import { Group, Subject } from 'src/core/cist/dtos'
import {
	academicGroupTable,
	auditoriumTable,
	eventTable,
	eventToAcademicGroupTable,
	eventToTeacherTable,
	subjectTable,
	teacherTable,
} from 'src/db/schema'
import { PublicAditorium } from '../auditoriums/auditoriums.schema'
import { PublicTeacher } from '../teachers/teachers.schemas'

@Injectable()
export class GroupsRepository {
	constructor(
		@Inject(DATABASE_CONNECTION_TOKEN)
		private readonly db: PostgresJsDatabase,
	) {}

	async findAll(): Promise<Group[]> {
		return this.db
			.select()
			.from(academicGroupTable)
			.orderBy(asc(academicGroupTable.name))
	}

	async findGroupAuditoriums(groupId: number): Promise<PublicAditorium[]> {
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

	async findGroupSubjects(groupId: number): Promise<Subject[]> {
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

	async findGroupTeachers(groupId: number): Promise<PublicTeacher[]> {
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
}
