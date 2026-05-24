import CistCrawler, {
	AuditoryElement as CistAuditorium,
	Building as CistBuilding,
} from '@mindenit/cist-crawler'
import { CistParser } from '../../interfaces/parser.interface'
import { Inject } from '@nestjs/common'
import { CIST_CRAWLER_TOKEN } from 'src/components/cist-crawler/di-tokens'
import { Result } from 'better-result'
import {
	CistCrawlerErrorCodes,
	CistCrawlerException,
} from 'src/common/exceptions/cist-crawler.exception'
import { PromiseResult } from 'src/common/types'
import { AuditoriumParserOutput } from '../../cist.types'
import { Auditorium, AuditoriumType } from 'src/core/cist/dtos/auditorium.dto'
import { Array } from 'src/common/utils/array'
import { Building } from '../../dtos/builder.dto'
import {
	AuditoriumMapper,
	AuditoriumTypeMapper,
	BuildingMapper,
} from '../../mappers'
import { collectEntity } from '../../helpers/collect-entity.helper'

type Accumulator = {
	buildings: Building[]
	auditoriums: Auditorium[]
	auditoriumTypes: AuditoriumType[]
}

export class CistAuditoriumParser
	implements CistParser<AuditoriumParserOutput, CistCrawlerException>
{
	private readonly auditoriumMapper = new AuditoriumMapper()
	private readonly auditoriumTypeMapper = new AuditoriumTypeMapper()
	private readonly buildingMapper = new BuildingMapper()

	constructor(
		@Inject(CIST_CRAWLER_TOKEN)
		private readonly cistCrawler: CistCrawler,
	) {}

	async parse(): PromiseResult<AuditoriumParserOutput, CistCrawlerException> {
		const responseResult = await Result.tryPromise({
			try: () => this.cistCrawler.getAuditories(),
			catch: (e) =>
				new CistCrawlerException(
					CistCrawlerErrorCodes.FETCH_FAILED,
					e instanceof Error ? e.message : 'Failed to fetch auditories',
				),
		})

		if (responseResult.isErr()) {
			return Result.err(responseResult.error)
		}

		const acc: Accumulator = {
			buildings: [],
			auditoriums: [],
			auditoriumTypes: [],
		}
		const seenAuditoriums = new Set<string>()

		const response = responseResult.unwrap()

		if (!Object.hasOwn(response, 'university')) {
			return Result.ok(acc)
		}

		const university = response.university!

		for (const building of Array.orEmpty(university.buildings)) {
			this.processBuilding(building, acc, seenAuditoriums)
		}

		return Result.ok(acc)
	}

	private processBuilding(
		building: CistBuilding,
		acc: Accumulator,
		seen: Set<string>,
	): void {
		if (!building.auditories) {
			return
		}

		const buildingEntity = this.buildingMapper.toEntity(building)
		if (buildingEntity.isNone()) {
			return
		}

		for (const auditorium of building.auditories) {
			this.processAuditorium(auditorium, building.id, acc, seen)
		}

		acc.buildings.push(buildingEntity.value)
	}

	private processAuditorium(
		auditorium: CistAuditorium,
		buildingId: string,
		acc: Accumulator,
		seen: Set<string>,
	): void {
		if (!auditorium.short_name || seen.has(auditorium.id)) return

		for (const type of auditorium.auditory_types) {
			collectEntity(
				this.auditoriumTypeMapper,
				{ ...type, auditoriumId: auditorium.id },
				acc.auditoriumTypes,
			)
		}

		const ok = collectEntity(
			this.auditoriumMapper,
			{ ...auditorium, buildingId },
			acc.auditoriums,
		)

		if (!ok) {
			return
		}

		seen.add(auditorium.id)
	}
}
