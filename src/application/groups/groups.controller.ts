import { Controller, Get, HttpStatus, Param, Query } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { ZodResultResponse } from 'src/common/decorators/zod-result-response.decorator'

import {
	GetGroupParamsDto,
	GroupAuditoriumsResponseDto,
	GroupScheduleQueryDto,
	GroupScheduleResponseDto,
	GroupsResponseDto,
	GroupSubjectsResponseDto,
	GroupTeachersResponseDto,
} from './dtos/groups.dto'
import { GroupsRepository } from './groups.repository'

@ApiTags('Groups')
@Controller('groups')
export class GroupsController {
	constructor(private readonly groupsRepository: GroupsRepository) {}

	@ApiOperation({
		summary: 'Get groups',
		description: 'Get list of groups',
	})
	@ZodResultResponse({
		status: HttpStatus.OK,
		description: 'Successful response',
		type: GroupsResponseDto,
	})
	@Get()
	async findAll() {
		return this.groupsRepository.findAll()
	}

	@ApiOperation({
		summary: 'Get group auditoriums',
		description:
			'Get list of auditoriums for an appropriate group that are used during this academic year',
	})
	@ZodResultResponse({
		status: HttpStatus.OK,
		description: 'Successful response',
		type: GroupAuditoriumsResponseDto,
	})
	@Get(':id/auditoriums')
	async findGroupAuditoriums(@Param() params: GetGroupParamsDto) {
		return this.groupsRepository.findGroupAuditoriums(params.id)
	}

	@ApiOperation({
		summary: 'Get group subjects',
		description:
			'Get list of subjects for an appropriate group that are thought this academic year',
	})
	@ZodResultResponse({
		status: HttpStatus.OK,
		description: 'Successful response',
		type: GroupSubjectsResponseDto,
	})
	@Get(':id/subjects')
	async findGroupSubjects(@Param() params: GetGroupParamsDto) {
		return this.groupsRepository.findGroupSubjects(params.id)
	}

	@ApiOperation({
		summary: 'Get group teachers',
		description:
			'Get list of teachers for an appropeiate group that teach during this academic year',
	})
	@ZodResultResponse({
		status: HttpStatus.OK,
		description: 'Successful response',
		type: GroupTeachersResponseDto,
	})
	@Get(':id/teachers')
	async findGroupTeachers(@Param() params: GetGroupParamsDto) {
		return this.groupsRepository.findGroupTeachers(params.id)
	}

	@ApiOperation({
		summary: 'Get group schedule',
		description: 'Get schedule for a group in particular time interval',
	})
	@ZodResultResponse({
		status: HttpStatus.OK,
		description: 'Successful response',
		type: GroupScheduleResponseDto,
	})
	@Get(':id/schedule')
	async findGroupSchedule(
		@Param() params: GetGroupParamsDto,
		@Query() query: GroupScheduleQueryDto,
	) {
		return this.groupsRepository.findSchedule({ id: params.id, ...query })
	}
}
