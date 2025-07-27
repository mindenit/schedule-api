import { z, type ZodSchema } from 'zod'

export const generateSuccessResponseSchema = (schema: ZodSchema) => {
	return z.object({
		success: z.literal(true).describe('Flag if request completed successfully'),
		data: schema.describe('Response data'),
		message: z.string().optional().describe('Response message'),
		error: z.null().describe('Response error'),
	})
}

export const generateFailureResponseSchema = (statusCode: number) => {
	return z.object({
		success: z.literal(false).describe('Flag if request failed'),
		data: z.null().describe('Response data'),
		message: z.string().optional().describe('Response message'),
		error: z
			.object({
				status: z.literal(statusCode).describe('HTTP status code'),
				message: z.string().describe('Error message'),
			})
			.describe('Response error'),
	})
}
