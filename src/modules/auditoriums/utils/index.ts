import type { Maybe } from '@/core/types/common.js'
import type { Auditorium } from '@/db/types.js'

export const isDLAuditorium = (auditorium: Maybe<Auditorium>): boolean => {
	return auditorium?.name.startsWith('DL') ?? false
}
