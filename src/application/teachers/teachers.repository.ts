import { Inject, Injectable } from '@nestjs/common'
import { asc, eq, SQL } from 'drizzle-orm'
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { ScheduleRepository } from 'src/common/repositories/schedule.repository'
import { scheduleAliases } from 'src/common/utils/schedule/schedule'
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

import { GetTeacherScheduleFilters } from './teachers.schemas'
import { getTeacherFiltersQuery } from './utils/filters-query.util'

@Injectable()
export class TeachersRepository extends ScheduleRepository<GetTeacherScheduleFilters> {
	constructor(
		@Inject(DATABASE_CONNECTION_TOKEN)
		db: PostgresJsDatabase,
	) {
		super(db)
	}

	async findAll(): Promise<Teacher[]> {
		return this.db
			.select()
			.from(teacherTable)
			.orderBy(asc(teacherTable.shortName))
	}

	async findTeacherAuditoriums(teacherId: number): Promise<Auditorium[]> {
		return this.db
			.selectDistinct({
				id: auditoriumTable.id,
				name: auditoriumTable.name,
				buildingId: auditoriumTable.buildingId,
				floor: auditoriumTable.floor,
				hasPower: auditoriumTable.hasPower,
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

	async findTeacherGroups(teacherId: number): Promise<Group[]> {
		return this.db
			.selectDistinct({
				id: academicGroupTable.id,
				name: academicGroupTable.name,
				directionId: academicGroupTable.directionId,
				specialityId: academicGroupTable.specialityId,
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

	protected scopePredicate(id: number): SQL {
		return eq(scheduleAliases.ett1.teacherId, id)
	}

	protected buildFilters(
		filters: GetTeacherScheduleFilters,
	): (SQL | undefined)[] {
		return getTeacherFiltersQuery(filters)
	}
}
