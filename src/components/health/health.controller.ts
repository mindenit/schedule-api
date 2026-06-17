import { Controller, Get, HttpStatus } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { ZodResultResponse } from 'src/common/decorators/zod-result-response.decorator'

import { HealthResponseDto } from './dtos/health.dto'
import { HealthService } from './health.service'

@ApiTags('System Check')
@Controller('health')
export class HealthController {
	constructor(private readonly healthService: HealthService) {}

	@ApiOperation({
		summary: 'Get system status',
		description: 'Returns the health status of the application',
	})
	@ZodResultResponse({
		status: HttpStatus.OK,
		description: 'Health check successful',
		type: HealthResponseDto,
	})
	@Get()
	async checkHealth() {
		return this.healthService.checkHealth()
	}
}
