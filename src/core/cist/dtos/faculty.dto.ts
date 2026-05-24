import z from 'zod'

const FacultySchema = z.object({
	id: z.number().int(),
	fullName: z.string().nonempty(),
	shortName: z.string().nonempty(),
})

type Faculty = z.infer<typeof FacultySchema>

export { FacultySchema }
export type { Faculty }
