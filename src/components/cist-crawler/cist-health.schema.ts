import z from 'zod'

// CIST health probe. Keys are identified by 1-based position only.
export const cistHealthSchema = z.object({
	checkedAt: z.iso.datetime(),
	servers: z.array(
		z.object({
			host: z.string(),
			up: z.boolean(),
			latencyMs: z.number().int().nonnegative().nullable(),
			keys: z.array(
				z.object({
					index: z.number().int().positive(),
					status: z.enum(['valid', 'rejected', 'unknown']),
					reason: z.string().optional(),
				}),
			),
		}),
	),
	// Every key rejected on every reachable server: revoked keys or CIST auth fault
	ambiguous: z.boolean(),
})

export type CistHealth = z.infer<typeof cistHealthSchema>
