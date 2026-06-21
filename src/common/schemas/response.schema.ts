import z from 'zod'

export const getSuccessResponseSchema = <T>(dataSchema: z.ZodType<T>) => {
	return z.object({
		success: z.boolean().default(true),
		data: dataSchema,
		message: z.string().optional(),
		error: z.null().default(null),
	})
}
