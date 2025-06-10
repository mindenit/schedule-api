import type { Maybe } from './common.js'

interface BaseParser<T extends object> {
	parse: () => Promise<Maybe<T>>
}

export type { BaseParser }
