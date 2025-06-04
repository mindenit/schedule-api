import { z } from 'zod'

const HEALTH_CHECK_SCHEMA = z
	.object({
		uptime: z.number().positive(),
		message: z.string(),
		date: z.date(),
	})
	.describe('Successful response')

export { HEALTH_CHECK_SCHEMA }
