import {
	Controller,
	Get,
	HttpStatus,
	Param,
	ParseIntPipe,
	Query,
} from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { ZodResultResponse } from 'src/common/decorators/zod-result-response.decorator'

import { DashboardService } from './dashboard.service'
import {
	DashRunGroupsResponseDto,
	DashRunsResponseDto,
	DashSummaryResponseDto,
} from './dtos/dashboard.dto'

@ApiTags('Dashboard')
@Controller('dash')
export class DashboardController {
	constructor(private readonly dashboardService: DashboardService) {}

	@ApiOperation({ summary: 'Current sync status and last run info' })
	@ZodResultResponse({ status: HttpStatus.OK, type: DashSummaryResponseDto })
	@Get('summary')
	getSummary() {
		return this.dashboardService.getSummary()
	}

	@ApiOperation({ summary: 'Recent sync runs' })
	@ZodResultResponse({ status: HttpStatus.OK, type: DashRunsResponseDto })
	@Get('runs')
	getRuns(
		@Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
	) {
		return this.dashboardService.getRuns(limit)
	}

	@ApiOperation({ summary: 'Group results for a specific run' })
	@ZodResultResponse({ status: HttpStatus.OK, type: DashRunGroupsResponseDto })
	@Get('runs/:runId/groups')
	getRunGroups(@Param('runId', ParseIntPipe) runId: number) {
		return this.dashboardService.getRunGroups(runId)
	}
}
