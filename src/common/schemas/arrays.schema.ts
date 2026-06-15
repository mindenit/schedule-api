import z, { ZodType } from 'zod'

const arrayFromFallible = <T>(schema: ZodType<T>): ZodType<T[]> => {
	return z
		.array(schema.nullable().catch(null))
		.transform((items) => items.filter((item): item is T => item !== null))
}

export { arrayFromFallible }
