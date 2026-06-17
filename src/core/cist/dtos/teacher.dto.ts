import z from 'zod'

const TeacherSchema = z.object({
	id: z.number().int().describe('Teacher identifier'),
	fullName: z
		.string()
		.describe('Last name, first name, and patronymic of teacher'),
	shortName: z.string().describe('Last name and initials of teacher'),
	departmentId: z
		.number()
		.int()
		.describe('Identifier of department teacher belongs to'),
})

type Teacher = z.infer<typeof TeacherSchema>

export { TeacherSchema }
export type { Teacher }
