import z from 'zod'

const AuditoriumSchema = z.object({
	id: z.number().int().describe('Auditorium identifier'),
	name: z.string().max(255).describe('Name of auditorium'),
	floor: z.number().int().describe('Floor where auditorium is located'),
	hasPower: z.boolean(),
	buildingId: z
		.string()
		.describe('Identifier of building where auditorium is located'),
})

type Auditorium = z.infer<typeof AuditoriumSchema>

const AuditoriumTypeSchema = z.object({
	id: z.number().int().describe('Auditorium type identifier'),
	name: z.string().max(255).describe('Name of auditorium type'),
	auditoriumId: z.number().int().describe('Identifier of auditorium'),
})

type AuditoriumType = z.infer<typeof AuditoriumTypeSchema>

export { AuditoriumSchema, AuditoriumTypeSchema }
export type { Auditorium, AuditoriumType }
