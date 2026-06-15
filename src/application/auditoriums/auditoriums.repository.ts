import { Inject, Injectable } from '@nestjs/common'
import { asc, eq, notLike, SQL } from 'drizzle-orm'
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

import { GetAuditoriumScheduleFilters } from './auditoriums.schema'
import { getAuditoriumFiltersQuery } from './utils/filters-query.util'

@Injectable()
export class AuditoriumsRepository extends ScheduleRepository<GetAuditoriumScheduleFilters> {
	constructor(
		@Inject(DATABASE_CONNECTION_TOKEN)
		db: PostgresJsDatabase,
	) {
		super(db)
	}

	protected scopePredicate(id: number): SQL {
		return eq(scheduleAliases.e.auditoriumId, id)
	}

	protected buildFilters(
		filters: GetAuditoriumScheduleFilters,
	): (SQL | undefined)[] {
		return getAuditoriumFiltersQuery(filters)
	}

	async findAll(): Promise<Auditorium[]> {
		return this.db
			.select()
			.from(auditoriumTable)
			.where(notLike(auditoriumTable.name, 'DL%'))
			.orderBy(asc(auditoriumTable.name))
	}

	async findAuditoriumGroups(
		auditoriumId: number,
	): Promise<Pick<Group, 'id' | 'name'>[]> {
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

	async findAuditoriumTeachers(
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

	async findAuditoriumSubjects(auditoriumId: number): Promise<Subject[]> {
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
