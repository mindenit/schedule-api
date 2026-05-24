import z from 'zod'

const DirectionSchema = z.object({
	id: z.number().int(),
	fullName: z.string().nonempty(),
	shortName: z.string().nonempty(),
	facultyId: z.number().int(),
})

type Direction = z.infer<typeof DirectionSchema>

export { DirectionSchema }
export type { Direction }
