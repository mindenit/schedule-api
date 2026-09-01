import {
	Controller,
	Get,
	HttpStatus,
	Param,
	ParseIntPipe,
	Query,
	UseGuards,
} from '@nestjs/common'
import { ApiExcludeController, ApiOperation } from '@nestjs/swagger'
import { ZodResultResponse } from 'src/common/decorators/zod-result-response.decorator'
import { DashKeyGuard } from 'src/common/guards/dash-key.guard'

import { DashboardService } from './dashboard.service'
import {
	DashFailuresResponseDto,
	DashRunGroupsResponseDto,
	DashRunsResponseDto,
	DashSummaryResponseDto,
	DashTableSizesResponseDto,
} from './dtos/dashboard.dto'

@ApiExcludeController()
@UseGuards(DashKeyGuard)
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

	@ApiOperation({ summary: 'Recent failed group entries across all runs' })
	@ZodResultResponse({ status: HttpStatus.OK, type: DashFailuresResponseDto })
	@Get('failures')
	getFailures(
		@Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
	) {
		return this.dashboardService.getFailures(limit)
	}

	@ApiOperation({ summary: 'Postgres table sizes and row counts' })
	@ZodResultResponse({ status: HttpStatus.OK, type: DashTableSizesResponseDto })
	@Get('table-sizes')
	getTableSizes() {
		return this.dashboardService.getTableSizes()
	}
}
