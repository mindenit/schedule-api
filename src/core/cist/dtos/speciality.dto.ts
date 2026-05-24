import z from 'zod'

const SpecialitySchema = z.object({
	id: z.number().int(),
	fullName: z.string().nonempty(),
	shortName: z.string().nonempty(),
	directionId: z.number().int(),
})

type Speciality = z.infer<typeof SpecialitySchema>

export { SpecialitySchema }
export type { Speciality }
