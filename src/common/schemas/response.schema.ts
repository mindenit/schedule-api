import z from 'zod'

export const getSuccessResponseSchema = <T>(dataSchema: z.ZodType<T>) => {
	return z.object({
		data: dataSchema,
	})
}
