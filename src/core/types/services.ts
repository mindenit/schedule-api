import type { Schedule } from '@/db/types.js'
import type { GET_SCHEDULE_OPTIONS } from '@/modules/schedule/schemas/index.js'
import type { Maybe } from './index.js'

interface FindableById<TResult, TIdentifier = number, TParams = never> {
	findOne: (id: TIdentifier, params: TParams) => Promise<Maybe<TResult>>
}

interface Creatable<TData extends object, TResult extends object> {
	createOne: (data: TData) => Promise<TResult>
}

interface Schedulable<TResult = Schedule[]> {
	getSchedule: (options: GET_SCHEDULE_OPTIONS) => Promise<TResult>
}

export type { Schedulable, FindableById, Creatable }
