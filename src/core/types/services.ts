import type { Schedule } from '@/db/types.js'
import type { GET_SCHEDULE_OPTIONS } from '@/modules/schedule/schemas/index.js'
import type { Maybe } from './index.js'

interface FindableById<TResult extends object> {
	findOne: (id: number) => Promise<Maybe<TResult>>
}

interface Schedulable<TFilters extends object, TResult = Schedule[]> {
	getSchedule: (options: GET_SCHEDULE_OPTIONS<TFilters>) => Promise<TResult>
}

export type { Schedulable, FindableById }
