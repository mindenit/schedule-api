import { z } from 'zod'

const HEALTH_CHECK_SCHEMA = z
	.object({
		uptime: z.number().positive(),
		message: z.string(),
		date: z.date(),
	})
	.describe('Successful response')

const GET_ENTITY_BY_ID_SCHEMA = z.object({
	id: z.coerce.number().int(),
})

type GET_ENTITY_BY_ID = z.infer<typeof GET_ENTITY_BY_ID_SCHEMA>

export { HEALTH_CHECK_SCHEMA, GET_ENTITY_BY_ID_SCHEMA }
export type { GET_ENTITY_BY_ID }
