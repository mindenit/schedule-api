import { z } from 'zod'

const AUDITORIUM_SCHEMA = z.object({
	id: z.number().int().describe('Auditorium identifier'),
	name: z.string().max(255).describe('Name of auditorium'),
	floor: z.number().int().describe('Floor where auditorium is located'),
	hasPower: z.boolean(),
	buildingId: z
		.string()
		.describe('Identifier of building where auditorium is located'),
})

export { AUDITORIUM_SCHEMA }
