import z from 'zod'

const DepartmentSchema = z.object({
	id: z.number().int(),
	fullName: z.string().nonempty(),
	shortName: z.string().nonempty(),
	facultyId: z.number().int(),
})

type Department = z.infer<typeof DepartmentSchema>

export { DepartmentSchema }
export type { Department }
