const SCHEDULE_TYPE = {
	GROUP: 1,
	TEACHER: 2,
	AUDITORIUM: 3,
} as const

type ScheduleType = (typeof SCHEDULE_TYPE)[keyof typeof SCHEDULE_TYPE]

export { SCHEDULE_TYPE }
export type { ScheduleType }
