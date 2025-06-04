import { z } from 'zod'

const CREATE_USER_SCHEMA = z.object({
	name: z.string().min(2).max(50),
})

type CREATE_USER_TYPE = z.infer<typeof CREATE_USER_SCHEMA>

export { CREATE_USER_SCHEMA }
export type { CREATE_USER_TYPE }
