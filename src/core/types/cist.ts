import type { Maybe } from './common.js'

interface CistParser<T extends object> {
	parse: () => Promise<Maybe<T>>
}

interface CistProcessor<T extends object> {
	process: () => Promise<T>
}

export type { CistParser, CistProcessor }
