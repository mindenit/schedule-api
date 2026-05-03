import z from 'zod'

export interface EntityMapper<From, To> {
	schema: z.ZodType<To>

	toEntity(from: From): To
}
