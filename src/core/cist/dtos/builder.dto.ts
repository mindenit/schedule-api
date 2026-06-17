import z from 'zod'

const BuildingSchema = z.object({
	id: z.string().nonempty().describe('Building identifier'),
	fullName: z.string().min(1).max(255).describe('Full building name'),
	shortName: z.string().min(1).max(40).describe('Short building name'),
})

type Building = z.infer<typeof BuildingSchema>

export { BuildingSchema }
export type { Building }
