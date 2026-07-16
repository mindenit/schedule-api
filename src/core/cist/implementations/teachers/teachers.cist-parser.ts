import CistCrawler, {
	Department as CistDepartment,
	Faculty as CistFaculty,
	Teacher as CistTeacher,
} from '@mindenit/cist-crawler'
import { Inject, Injectable, Logger } from '@nestjs/common'
import { Result } from 'better-result'
import {
	CistCrawlerErrorCodes,
	CistCrawlerException,
} from 'src/common/exceptions/cist-crawler.exception'
import { PromiseResult } from 'src/common/types'
import { Array } from 'src/common/utils/array'
import { CIST_CRAWLER_TOKEN } from 'src/components/cist-crawler/di-tokens'

import { TeachersParserOutput } from '../../cist.types'
import { Department, Faculty, Teacher } from '../../dtos'
import { collectEntity } from '../../helpers/collect-entity.helper'
import { CistParser } from '../../interfaces/parser.interface'
import { DepartmentMapper } from '../../mappers/department.mapper'
import { FacultyMapper } from '../../mappers/faculty.mapper'
import { TeacherMapper } from '../../mappers/teacher.mapper'

// Types
interface Accumulator {
	teachers: Teacher[]
	faculties: Faculty[]
	departments: Department[]
}

@Injectable()
export class CistTeachersParser implements CistParser<
	TeachersParserOutput,
	CistCrawlerException
> {
	private readonly logger = new Logger(CistTeachersParser.name)

	private readonly facultyMapper = new FacultyMapper()
	private readonly departmentMapper = new DepartmentMapper()
	private readonly teacherMapper = new TeacherMapper()

	constructor(
		@Inject(CIST_CRAWLER_TOKEN)
		private readonly cistCrawler: CistCrawler,
	) {}

	async parse(): PromiseResult<TeachersParserOutput, CistCrawlerException> {
		const responseResult = await Result.tryPromise({
			try: () => this.cistCrawler.getTeachers(),
			catch: (e) =>
				new CistCrawlerException(
					CistCrawlerErrorCodes.FETCH_FAILED,
					e instanceof Error ? e.message : 'Failed to fetch teachers',
				),
		})

		if (responseResult.isErr()) {
			return Result.err(responseResult.error)
		}

		const acc: Accumulator = {
			teachers: [],
			faculties: [],
			departments: [],
		}
		const seenTeachers = new Set<number>()

		const response = responseResult.unwrap()

		if (!Object.hasOwn(response, 'university')) {
			return Result.ok(acc)
		}

		const university = response.university!

		for (const faculty of Array.orEmpty(university.faculties)) {
			this.processFaculty(faculty, acc, seenTeachers)
		}

		return Result.ok(acc)
	}

	private processFaculty(
		faculty: CistFaculty,
		acc: Accumulator,
		seen: Set<number>,
	): void {
		collectEntity(this.facultyMapper, faculty, acc.faculties)

		for (const department of Array.orEmpty(faculty.departments)) {
			this.processDepartment(department, faculty.id, acc, seen)

			for (const subDepartment of Array.orEmpty(department.departments)) {
				this.processDepartment(subDepartment, faculty.id, acc, seen)
			}
		}
	}

	private processDepartment(
		department: CistDepartment,
		facultyId: number,
		acc: Accumulator,
		seen: Set<number>,
	): void {
		const ok = collectEntity(
			this.departmentMapper,
			{ ...department, facultyId },
			acc.departments,
		)
		if (!ok) {
			return
		}

		for (const teacher of Array.orEmpty(department.teachers)) {
			this.processTeacher(teacher, department.id, acc, seen)
		}
	}

	private processTeacher(
		teacher: CistTeacher,
		departmentId: number,
		acc: Accumulator,
		seen: Set<number>,
	): void {
		if (seen.has(teacher.id)) {
			return
		}

		const ok = collectEntity(
			this.teacherMapper,
			{ ...teacher, departmentId },
			acc.teachers,
		)
		if (!ok) {
			return
		}

		seen.add(teacher.id)
	}
}
