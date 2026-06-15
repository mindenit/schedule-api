import { Controller, Get, HttpStatus, Param, Query } from '@nestjs/common'
import { ApiOperation } from '@nestjs/swagger'
import { ZodResultResponse } from 'src/common/decorators/zod-result-response.decorator'
import { AuditoriumsRepository } from './auditoriums.repository'
import {
	AuditoriumGroupsResponseDto,
	AuditoriumsResponseDto,
	AuditoriumsScheduleResponseDto,
	AuditoriumSubjectsResponseDto,
	AuditoriumTeachersResponseDto,
	GetAuditoriumParamsDto,
	GetAuditoriumScheduleQueryDto,
} from './dtos/auditoriums.dto'

@Controller('auditoriums')
export class AuditoriumsController {
	constructor(private readonly auditoriumsRepository: AuditoriumsRepository) {}

	@ApiOperation({
		summary: 'Get auditoriums',
		description: 'Get list of auditoriums',
	})
	@ZodResultResponse({
		status: HttpStatus.OK,
		description: 'Successful response',
		type: AuditoriumsResponseDto,
	})
	@Get()
	async findAll() {
		return this.auditoriumsRepository.findAll()
	}

	@ApiOperation({
		summary: 'Get auditorium groups',
		description: 'Get groups for a specific auditorium',
	})
	@ZodResultResponse({
		status: HttpStatus.OK,
		description: 'Successful response',
		type: AuditoriumGroupsResponseDto,
	})
	@Get(':id/groups')
	async findAuditoriumGroups(@Param() params: GetAuditoriumParamsDto) {
		return this.auditoriumsRepository.findAuditoriumGroups(params.id)
	}

	@ApiOperation({
		summary: 'Get auditorium subjects',
		description: 'Get subjects for a specific auditorium',
	})
	@ZodResultResponse({
		status: HttpStatus.OK,
		description: 'Successful response',
		type: AuditoriumSubjectsResponseDto,
	})
	@Get(':id/subjects')
	async findAuditoriumSubjects(@Param() params: GetAuditoriumParamsDto) {
		return this.auditoriumsRepository.findAuditoriumSubjects(params.id)
	}

	@ApiOperation({
		summary: 'Get auditorium teachers',
		description: 'Get teachers for a specific auditorium',
	})
	@ZodResultResponse({
		status: HttpStatus.OK,
		description: 'Successful response',
		type: AuditoriumTeachersResponseDto,
	})
	@Get(':id/teachers')
	async findAuditoriumTeachers(@Param() params: GetAuditoriumParamsDto) {
		return this.auditoriumsRepository.findAuditoriumTeachers(params.id)
	}

	@ApiOperation({
		summary: 'Get auditorium schedule',
		description: 'Get schedule for an auditorium in particular time interval',
	})
	@ZodResultResponse({
		status: HttpStatus.OK,
		description: 'Successful response',
		type: AuditoriumsScheduleResponseDto,
	})
	@Get(':id/schedule')
	async findAuditoriumSchedule(
		@Param() params: GetAuditoriumParamsDto,
		@Query() query: GetAuditoriumScheduleQueryDto,
	) {
		return this.auditoriumsRepository.findSchedule({
			id: params.id,
			...query,
		})
	}
}
