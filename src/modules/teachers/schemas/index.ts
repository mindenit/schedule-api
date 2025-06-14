import { z } from 'zod'

const TEACHER_SCHEMA = z.object({
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

export { TEACHER_SCHEMA }
