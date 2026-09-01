import { createZodDto } from 'nestjs-zod'
import z from 'zod'

// Shared
const stepResultSchema = z.object({
	ok: z.boolean(),
	count: z.number().int().nonnegative(),
	error: z.string().optional(),
})

const stepsSchema = z.object({
	auditoriums: stepResultSchema,
	groups: stepResultSchema,
	teachers: stepResultSchema,
})

// Sync run row
export const syncRunSchema = z.object({
	id: z.number(),
	startedAt: z.date(),
	finishedAt: z.date().nullable(),
	status: z.enum(['running', 'success', 'partial', 'failed']),
	trigger: z.enum(['cron', 'bootstrap']),
	totalGroups: z.number().int(),
	failedGroups: z.number().int(),
	removedEvents: z.number().int(),
	steps: stepsSchema,
})

export type SyncRunDto = z.infer<typeof syncRunSchema>

// Sync run group row
export const syncRunGroupSchema = z.object({
	runId: z.number(),
	groupId: z.number(),
	status: z.enum(['success', 'failed']),
	eventsCount: z.number().int(),
	error: z.string().nullable(),
	finishedAt: z.date(),
})

export type SyncRunGroupDto = z.infer<typeof syncRunGroupSchema>

// Summary
export const dashSummarySchema = z.object({
	currentStatus: z.enum(['running', 'success', 'partial', 'failed', 'unknown']),
	isRunning: z.boolean(),
	lastRun: syncRunSchema.nullable(),
	lastSuccessfulRun: syncRunSchema.nullable(),
	nextCronAt: z.date().nullable(),
	totalRuns: z.number().int(),
	progress: z
		.object({
			current: z.number().int(),
			total: z.number().int(),
		})
		.nullable(),
})

export type DashSummaryDto = z.infer<typeof dashSummarySchema>

// DTOs for Nest-Zod serializer
export class DashSummaryResponseDto extends createZodDto(
	z.object({
		success: z.literal(true),
		data: dashSummarySchema,
		error: z.null(),
	}),
) {}

export class DashRunsResponseDto extends createZodDto(
	z.object({
		success: z.literal(true),
		data: z.array(syncRunSchema),
		error: z.null(),
	}),
) {}

export class DashRunGroupsResponseDto extends createZodDto(
	z.object({
		success: z.literal(true),
		data: z.array(syncRunGroupSchema),
		error: z.null(),
	}),
) {}
