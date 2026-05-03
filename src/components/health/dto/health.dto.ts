import { createZodDto } from 'nestjs-zod'
import { SYSTEM_HEALTH_STATUS } from 'src/common/constants/health-status'
import { createResponseSchema } from 'src/common/utils/response/response'
import z from 'zod'

const HealthResponseSchema = z.object({
	uptime: z.number().positive().describe('Uptime in milliseconds'),
	status: z.enum(Object.values(SYSTEM_HEALTH_STATUS)).describe('Health status'),
	lastUpdated: z.iso.datetime().describe('Last updated timestamp'),
})

type HealthResponse = z.infer<typeof HealthResponseSchema>

class HealthResponseDto extends createZodDto(
	createResponseSchema(HealthResponseSchema),
) {}

export { HealthResponseDto }
export type { HealthResponse }
