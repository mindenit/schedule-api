import { Controller, Get, HttpStatus, Param, Query } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { ZodResultResponse } from 'src/common/decorators/zod-result-response.decorator'
import { Subject } from 'src/core/cist/dtos'

import { PublicAditorium } from '../auditoriums/auditoriums.schema'
import {
	GetTeacherParamsDto,
	TeacherAuditoriumsResponseDto,
	TeacherGroupsResponseDto,
	TeacherScheduleQueryDto,
	TeacherScheduleResponseDto,
	TeachersResponseDto,
	TeacherSubjectsResponseDto,
} from './dtos/teachers.dto'
import { TeachersRepository } from './teachers.repository'
import { PublicTeacher } from './teachers.schemas'

@ApiTags('Teachers')
@Controller('teachers')
export class TeachersController {
	constructor(private readonly teachersRepository: TeachersRepository) {}

	@ApiOperation({
		summary: 'Get teachers',
		description: 'Get list of teachers',
	})
	@ZodResultResponse({
		status: HttpStatus.OK,
		description: 'Successful response',
		type: TeachersResponseDto,
	})
	@Get()
	async findAll(): Promise<PublicTeacher[]> {
		return this.teachersRepository.findAll()
	}

	@ApiOperation({
		summary: 'Get teacher auditoriums',
		description: 'Get auditoriums for a specific teacher',
	})
	@ZodResultResponse({
		status: HttpStatus.OK,
		description: 'Successful response',
		type: TeacherAuditoriumsResponseDto,
	})
	@Get(':id/auditoriums')
	async findTeacherAuditoriums(
		@Param() params: GetTeacherParamsDto,
	): Promise<PublicAditorium[]> {
		return this.teachersRepository.findTeacherAuditoriums(params.id)
	}

	@ApiOperation({
		summary: 'Get teacher groups',
		description: 'Get groups for a specific teacher',
	})
	@ZodResultResponse({
		status: HttpStatus.OK,
		description: 'Successful response',
		type: TeacherGroupsResponseDto,
	})
	@Get(':id/groups')
	async findTeacherGroups(
		@Param() params: GetTeacherParamsDto,
	): Promise<PublicAditorium[]> {
		return this.teachersRepository.findTeacherGroups(params.id)
	}

	@ApiOperation({
		summary: 'Get teacher subjects',
		description: 'Get subjects for a specific teacher',
	})
	@ZodResultResponse({
		status: HttpStatus.OK,
		description: 'Successful response',
		type: TeacherSubjectsResponseDto,
	})
	@Get(':id/subjects')
	async findTeacherSubjects(
		@Param() params: GetTeacherParamsDto,
	): Promise<Subject[]> {
		return this.teachersRepository.findTeacherSubjects(params.id)
	}

	@ApiOperation({
		summary: 'Get group schedule',
		description: 'Get schedule for a group in particular time interval',
	})
	@ZodResultResponse({
		status: HttpStatus.OK,
		description: 'Successful response',
		type: TeacherScheduleResponseDto,
	})
	@Get(':id/schedule')
	async findGroupSchedule(
		@Param() params: GetTeacherParamsDto,
		@Query() query: TeacherScheduleQueryDto,
	) {
		return this.teachersRepository.findSchedule({
			id: params.id,
			...query,
		})
	}
}
