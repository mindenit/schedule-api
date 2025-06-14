import { z, type ZodSchema } from 'zod'

export const generateResponseSchema = (schema: ZodSchema) => {
	return z.object({
		success: z.literal(true).describe('Flag if request completed successfully'),
		data: schema.describe('Response data'),
		message: z.string().describe('Response message'),
		error: z.null().describe('Response error'),
	})
}
