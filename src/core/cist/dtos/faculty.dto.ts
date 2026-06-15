import z from 'zod'

const FacultySchema = z.object({
	id: z.number().int(),
	fullName: z.string().max(255).nonempty(),
	shortName: z.string().max(40).nonempty(),
})

type Faculty = z.infer<typeof FacultySchema>

export { FacultySchema }
export type { Faculty }
