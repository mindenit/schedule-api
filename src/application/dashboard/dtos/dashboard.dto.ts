import { createZodDto } from 'nestjs-zod'
import z from 'zod'

// Shared
const stepResultSchema = z.object({
	ok: z.boolean(),
	count: z.number().int().nonnegative(),
	error: z.string().optional(),
})

const stepsSchema = z.object({
	auditoriums: stepResultSchema.optional(),
	groups: stepResultSchema.optional(),
	teachers: stepResultSchema.optional(),
})

// Sync run row
export const syncRunSchema = z.object({
	id: z.number(),
	startedAt: z.iso.datetime(),
	finishedAt: z.iso.datetime().nullable(),
	status: z.enum(['running', 'success', 'partial', 'failed']),
	trigger: z.enum(['cron', 'bootstrap']),
	totalGroups: z.number().int(),
	failedGroups: z.number().int(),
	removedEvents: z.number().int(),
	totalEvents: z.number().int(),
	steps: stepsSchema,
})

export type SyncRunDto = z.infer<typeof syncRunSchema>

// Sync run group row (with delta vs previous run)
export const syncRunGroupSchema = z.object({
	runId: z.number(),
	groupId: z.number(),
	groupName: z.string().nullable(),
	status: z.enum(['success', 'failed']),
	eventsCount: z.number().int(),
	prevEventsCount: z.number().int().nullable(),
	error: z.string().nullable(),
	finishedAt: z.iso.datetime(),
})

export type SyncRunGroupDto = z.infer<typeof syncRunGroupSchema>

// Failed group entry (across runs)
export const failedGroupEntrySchema = z.object({
	runId: z.number(),
	groupId: z.number(),
	groupName: z.string().nullable(),
	error: z.string().nullable(),
	finishedAt: z.iso.datetime(),
})

export type FailedGroupEntryDto = z.infer<typeof failedGroupEntrySchema>

// Table size entry
export const tableSizeEntrySchema = z.object({
	tableName: z.string(),
	rowCount: z.number().int(),
	sizePretty: z.string(),
	sizeBytes: z.number().int(),
})

export type TableSizeEntryDto = z.infer<typeof tableSizeEntrySchema>

// Summary
export const dashSummarySchema = z.object({
	currentStatus: z.enum(['running', 'success', 'partial', 'failed', 'unknown']),
	isRunning: z.boolean(),
	lastRun: syncRunSchema.nullable(),
	lastSuccessfulRun: syncRunSchema.nullable(),
	nextCronAt: z.iso.datetime().nullable(),
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

export class DashFailuresResponseDto extends createZodDto(
	z.object({
		success: z.literal(true),
		data: z.array(failedGroupEntrySchema),
		error: z.null(),
	}),
) {}

export class DashTableSizesResponseDto extends createZodDto(
	z.object({
		success: z.literal(true),
		data: z.array(tableSizeEntrySchema),
		error: z.null(),
	}),
) {}
