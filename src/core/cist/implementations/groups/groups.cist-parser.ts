import CistCrawler, {
	Direction as CistDirection,
	Faculty as CistFaculty,
} from '@mindenit/cist-crawler'
import { Inject, Injectable } from '@nestjs/common'
import { Result } from 'better-result'
import {
	CistCrawlerErrorCodes,
	CistCrawlerException,
} from 'src/common/exceptions/cist-crawler.exception'
import { PromiseResult } from 'src/common/types'
import { Array } from 'src/common/utils/array'
import { CIST_CRAWLER_TOKEN } from 'src/components/cist-crawler/di-tokens'
import { GroupsParserOutput } from '../../cist.types'
import { Direction, Faculty, Group, Speciality } from '../../dtos'
import { collectEntity } from '../../helpers/collect-entity.helper'
import { CistParser } from '../../interfaces/parser.interface'
import {
	DirectionMapper,
	FacultyMapper,
	GroupMapper,
	SpecialityMapper,
} from '../../mappers'

// Types
type Accumulator = {
	groups: Group[]
	faculties: Faculty[]
	specialities: Speciality[]
	directions: Direction[]
}

type CistSpeciality = Omit<CistDirection, 'specialities'>

@Injectable()
export class CistGroupsParser
	implements CistParser<GroupsParserOutput, CistCrawlerException>
{
	private readonly directionMapper = new DirectionMapper()
	private readonly facultyMapper = new FacultyMapper()
	private readonly groupMapper = new GroupMapper()
	private readonly specialityMapper = new SpecialityMapper()

	constructor(
		@Inject(CIST_CRAWLER_TOKEN)
		private readonly cistCrawler: CistCrawler,
	) {}

	async parse(): PromiseResult<GroupsParserOutput, CistCrawlerException> {
		const responseResult = await Result.tryPromise({
			try: () => this.cistCrawler.getGroups(),
			catch: (e) =>
				new CistCrawlerException(
					CistCrawlerErrorCodes.FETCH_FAILED,
					e instanceof Error ? e.message : 'Failed to fetch groups',
				),
		})

		if (responseResult.isErr()) {
			return Result.err(responseResult.error)
		}

		const acc: Accumulator = {
			groups: [],
			faculties: [],
			specialities: [],
			directions: [],
		}

		const response = responseResult.unwrap()

		if (!Object.hasOwn(response, 'university')) {
			return Result.ok(acc)
		}

		const university = response.university!

		for (const faculty of Array.orEmpty(university.faculties)) {
			this.processFaculty(faculty, acc)
		}

		return Result.ok(acc)
	}

	private processFaculty(faculty: CistFaculty, acc: Accumulator): void {
		if (!collectEntity(this.facultyMapper, faculty, acc.faculties)) return

		for (const direction of Array.orEmpty(faculty.directions)) {
			this.processDirection(direction, faculty.id, acc)
		}
	}

	private processDirection(
		direction: CistDirection,
		facultyId: number,
		acc: Accumulator,
	): void {
		const ok = collectEntity(
			this.directionMapper,
			{ ...direction, facultyId },
			acc.directions,
		)
		if (!ok) return

		for (const speciality of Array.orEmpty(direction.specialities)) {
			this.processSpeciality(speciality, direction.id, acc)
		}

		for (const group of Array.orEmpty(direction.groups)) {
			collectEntity(
				this.groupMapper,
				{ ...group, directionId: direction.id, specialityId: null },
				acc.groups,
			)
		}
	}

	private processSpeciality(
		speciality: CistSpeciality,
		directionId: number,
		acc: Accumulator,
	): void {
		const ok = collectEntity(
			this.specialityMapper,
			{ ...speciality, directionId },
			acc.specialities,
		)
		if (!ok) return

		for (const group of Array.orEmpty(speciality.groups)) {
			collectEntity(
				this.groupMapper,
				{ ...group, directionId, specialityId: speciality.id },
				acc.groups,
			)
		}
	}
}
