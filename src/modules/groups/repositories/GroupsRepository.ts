import type { DatabaseClient } from '@/core/types/deps.js'
import type {
	GroupsInjectableDependencies,
	GroupsRepository,
} from '../types/index.js'
import type { Group, Schedule, Subject } from '@/db/types.js'
import { academicGroupTable } from '@/db/schema/academic-group.js'
import { SQL, asc, eq, sql } from 'drizzle-orm'
import type { GET_SCHEDULE_OPTIONS } from '@/modules/schedule/schemas/index.js'
import {
	buildScheduleQuery,
	getTimeIntervalQuery,
} from '@/modules/schedule/utils/index.js'
import { eventTable } from '@/db/schema/event.js'
import { eventToAcademicGroupTable } from '@/db/schema/event-to-academic-group.js'
import { subjectTable } from '@/db/schema/subject.js'

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
	}

	async getSchedule(options: GET_SCHEDULE_OPTIONS): Promise<Schedule[]> {
		const { id } = options

		const whereClause: SQL[] = [sql`ag1.id = ${id}`]

		const timeInterval = getTimeIntervalQuery(options)

		whereClause.push(...timeInterval)

		const query = buildScheduleQuery(whereClause)

		const schedule = await this.db.execute(query)

		return schedule as unknown as Schedule[]
	}
}
