import { Controller, Get, HttpStatus } from '@nestjs/common'
import { HealthService } from './health.service'
import { ZodResultResponse } from 'src/common/decorators/zod-result-response.decorator'
import { HealthResponseDto } from './dto/health.dto'
import { ApiOperation, ApiTags } from '@nestjs/swagger'

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
