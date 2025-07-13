import type { Maybe } from '@/core/types/index.js'
import { eventTypeEnum } from '@/db/schema/event-type-enum.js'

export const queryParamToArray = (s: Maybe<string>): string[] => {
	return !s ? [] : s.includes(',') ? s.split(',') : [s]
}

export const transformEventTypesParam = (s: Maybe<string>): string[] => {
	return queryParamToArray(s).filter((item) => {
		// @ts-expect-error will be fixed soon
		return eventTypeEnum.enumValues.includes(item)
	})
}

export const transformIdsParam = (s: Maybe<string>): number[] => {
	return queryParamToArray(s).map(Number).filter(Number.isInteger)
}
