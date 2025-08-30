import { z } from 'zod'
import { HEALTH_STATUS } from '../constants/health.js'

const HEALTH_CHECK_SCHEMA = z
	.object({
		uptime: z.number().positive(),
		message: z.enum(Object.values(HEALTH_STATUS)),
		lastUpdated: z.date(),
	})
	.describe('Successful response')

const GET_ENTITY_BY_ID_SCHEMA = z.object({
	id: z.coerce.number().int(),
})

type GET_ENTITY_BY_ID = z.infer<typeof GET_ENTITY_BY_ID_SCHEMA>

export { GET_ENTITY_BY_ID_SCHEMA, HEALTH_CHECK_SCHEMA }
export type { GET_ENTITY_BY_ID }
