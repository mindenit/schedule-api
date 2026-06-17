import z from 'zod'

const SubjectSchema = z.object({
	id: z.number().int(),
	name: z.string().nonempty(),
	brief: z.string().nonempty(),
})

type Subject = z.infer<typeof SubjectSchema>

export { SubjectSchema }
export type { Subject }
