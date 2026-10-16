export const SCHEDULE_ENTITY = {
	GROUP: 'group',
	TEACHER: 'teacher',
	AUDITORIUM: 'auditorium',
} as const

export type ScheduleEntity =
	(typeof SCHEDULE_ENTITY)[keyof typeof SCHEDULE_ENTITY]

// One-shot: set it (any value) to let the next sync run bypass the groups-list
// ratio guard and the delete guard; the run consumes (deletes) it at start.
export const GUARD_OVERRIDE_KEY = 'sync:guard-override' as const
