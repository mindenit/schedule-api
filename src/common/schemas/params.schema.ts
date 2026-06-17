import z from 'zod'

export const GetByIdParamSchema = z.object({
	id: z.coerce.number().int(),
})
