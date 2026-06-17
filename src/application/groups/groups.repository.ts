import { Inject, Injectable } from '@nestjs/common'
import { asc, eq, SQL } from 'drizzle-orm'
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { ScheduleRepository } from 'src/common/repositories/schedule.repository'
import { scheduleAliases } from 'src/common/utils/schedule/schedule'
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
import { GetGroupScheduleFilters } from './groups.schema'
import { getGroupFiltersQuery } from './utils/filters-query.util'

@Injectable()
export class GroupsRepository extends ScheduleRepository<GetGroupScheduleFilters> {
	constructor(
		@Inject(DATABASE_CONNECTION_TOKEN)
		db: PostgresJsDatabase,
	) {
		super(db)
	}

	protected scopePredicate(id: number): SQL {
		return eq(scheduleAliases.ag1.id, id)
	}

	protected buildFilters(
		filters: GetGroupScheduleFilters,
	): (SQL | undefined)[] {
		return getGroupFiltersQuery(filters)
	}

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
