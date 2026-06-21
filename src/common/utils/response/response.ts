import z from 'zod'

/*
  Creates a response schema for a given data schema.
  @param schema - The data schema to use for the response.
  @returns A response schema that includes a `success` field and the given data schema.
*/
export const createResponseSchema = <T extends z.ZodObject>(schema: T) => {
	return z.object({
		success: z.literal(true).describe('Response status'),
		data: schema.describe('Response data'),
		message: z.string().optional().describe('Response message'),
		error: z.null().describe('Response error'),
	})
}
