import { eventTypeEnum } from 'src/db/schema'

const queryParamToArray = (param: string | null): string[] => {
	return !param
		? []
		: param.includes(',')
			? param.split(',').map((s) => s.trim())
			: [param]
}

export const transformEventTypes = (param: string | null): string[] => {
	return queryParamToArray(param).filter(eventTypeEnum.enumValues.includes)
}

export const transformIds = (param: string | null): number[] => {
	return queryParamToArray(param).map(Number).filter(Number.isInteger)
}
