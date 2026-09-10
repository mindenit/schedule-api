import z from 'zod'

// Shared across groups/teachers/auditoriums list endpoints. Defaults to
// false (unfiltered, current behavior) -- CIST reports many entities
// (graduated cohorts, admin/internal records) that never have a schedule.
export const HasEventsQuerySchema = z.object({
	hasEvents: z.stringbool().optional().default(false),
})
