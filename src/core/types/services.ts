import type { Schedule } from '@/db/types.js'
import type { GET_SCHEDULE_OPTIONS } from '@/modules/schedule/schemas/index.js'

interface Schedulable<TResult = Schedule[]> {
	getSchedule: (options: GET_SCHEDULE_OPTIONS) => Promise<TResult>
}

export type { Schedulable }
