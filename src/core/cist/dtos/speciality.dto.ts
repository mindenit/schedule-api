import z from 'zod'

const SpecialitySchema = z.object({
	id: z.number().int(),
	fullName: z.string().min(1).max(255),
	shortName: z.string().min(1).max(40),
	directionId: z.number().int(),
})

type Speciality = z.infer<typeof SpecialitySchema>

export { SpecialitySchema }
export type { Speciality }
