import z from 'zod'

const DirectionSchema = z.object({
	id: z.number().int(),
	fullName: z.string().min(1).max(255),
	shortName: z.string().min(1).max(40),
	facultyId: z.number().int(),
})

type Direction = z.infer<typeof DirectionSchema>

export { DirectionSchema }
export type { Direction }
