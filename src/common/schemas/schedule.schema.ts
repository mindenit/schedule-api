import { GroupSchema, TeacherSchema } from 'src/core/cist/dtos'
import { eventTypeEnum } from 'src/db/schema'
import z, { ZodType } from 'zod'

const ScheduleSchema = z.object({
	id: z.number().int().describe('Identifier of double period'),
	startedAt: z
		.number()
		.describe('Unix timestamp when double period is starting'),
	endedAt: z.number().describe('Unix timestamp when double period is ending'),
	type: z.enum(eventTypeEnum.enumValues).describe('Type of an event'),
	auditorium: z
		.object({
			id: z.number().describe('Auditorium identifier'),
			name: z
				.string()
				.describe('Name of an auditorium where double period is held'),
		})
		.describe('Auditorium where double period is held'),
	numberPair: z.number().int().min(1).describe('Number of pair'),
	subject: z
		.object({
			id: z.number().int().describe('Subject identifier'),
			title: z.string().describe('Title of subject'),
			brief: z.string().describe('Brief of subject'),
		})
		.describe('Subject from which there will be a double period'),
	groups: GroupSchema.omit({ directionId: true, specialityId: true })
		.array()
		.describe('List of groups which attend the class'),
	teachers: TeacherSchema.omit({ departmentId: true })
		.array()
		.describe('List of teachers who teach the class'),
	pairIndex: z
		.number()
		.int()
		.min(1)
		.describe('Index of the pair for the subject'),
	pairsCount: z
		.number()
		.int()
		.min(1)
		.describe('Total number of pairs for the subject'),
})

type Schedule = z.infer<typeof ScheduleSchema>

const GetScheduleTimeIntervalSchema = z.object({
	startedAt: z.coerce
		.number()
		.min(0)
		.refine((ts) => ts < 1e10, {
			message: 'Should be a Unix timestamp in seconds',
		})
		.nullable()
		.default(null)
		.describe('Start time of the schedule range'),
	endedAt: z.coerce
		.number()
		.min(0)
		.refine((ts) => ts < 1e10, {
			message: 'Should be a Unix timestamp in seconds',
		})
		.nullable()
		.default(null)
		.describe('End time of the schedule range'),
})

type GetScheduleTimeInterval = z.infer<typeof GetScheduleTimeIntervalSchema>

type GetScheduleQuery<T extends object> = GetScheduleTimeInterval & {
	filters: T
}
type GetScheduleOptions<T extends object> = { id: number } & GetScheduleQuery<T>

const getScheduleQuerySchema = <T extends object>(schema: ZodType<T>) => {
	return GetScheduleTimeIntervalSchema.extend({
		filters: schema,
	})
}

export { getScheduleQuerySchema, GetScheduleTimeIntervalSchema, ScheduleSchema }
export type { GetScheduleOptions, Schedule }
