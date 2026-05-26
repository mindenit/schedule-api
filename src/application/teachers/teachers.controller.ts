import { Controller, Get, HttpStatus, Param } from '@nestjs/common'
import { TeachersRepository } from './teachers.repository'
import { PublicTeacher } from './teachers.schemas'
import { ApiOperation } from '@nestjs/swagger'
import { ZodResultResponse } from 'src/common/decorators/zod-result-response.decorator'
import {
	GetTeacherParamsDto,
	TeacherAuditoriumsResponseDto,
	TeachersResponseDto,
	TeacherGroupsResponseDto,
	TeacherSubjectsResponseDto,
} from './dtos/teachers.dto'
import { PublicAditorium } from '../auditoriums/auditoriums.schema'
import { Subject } from 'src/core/cist/dtos'

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
}
