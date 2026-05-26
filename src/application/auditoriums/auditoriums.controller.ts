import { Controller, Get, HttpStatus, Param } from '@nestjs/common'
import { ApiOperation } from '@nestjs/swagger'
import { ZodResultResponse } from 'src/common/decorators/zod-result-response.decorator'
import { AuditoriumsRepository } from './auditoriums.repository'
import {
	AuditoriumGroupsResponseDto,
	AuditoriumsResponseDto,
	AuditoriumSubjectsResponseDto,
	AuditoriumTeachersResponseDto,
	GetAuditoriumParamsDto,
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
		return this.auditoriumsRepository.getGroups(params.id)
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
		return this.auditoriumsRepository.getSubjects(params.id)
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
		return this.auditoriumsRepository.getTeachers(params.id)
	}
}
