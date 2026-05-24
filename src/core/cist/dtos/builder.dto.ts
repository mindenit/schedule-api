import z from 'zod'

const BuildingSchema = z.object({
	id: z.string().nonempty().describe('Building identifier'),
	fullName: z.string().nonempty().describe('Full building name'),
	shortName: z.string().nonempty().describe('Short building name'),
})

type Building = z.infer<typeof BuildingSchema>

export { BuildingSchema }
export type { Building }
