export const SCHEDULE_ENTITY = {
	GROUP: 'group',
	TEACHER: 'teacher',
	AUDITORIUM: 'auditorium',
} as const

export type ScheduleEntity =
	(typeof SCHEDULE_ENTITY)[keyof typeof SCHEDULE_ENTITY]
