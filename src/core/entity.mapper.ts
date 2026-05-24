import type { Maybe } from 'src/common/utils/maybe'
import z from 'zod'

export interface EntityMapper<From, To> {
	schema: z.ZodType<To>

	toEntity(from: From): Maybe.Maybe<To>
}
