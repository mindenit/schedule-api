import { describe, expect, it } from 'vitest'

import { EnvSchema } from './config.schema'

const clientIds = (value: string) =>
	EnvSchema.shape.CIST_CLIENT_ID.safeParse(value)

describe('CIST_CLIENT_ID', () => {
	it('accepts a single key', () => {
		expect(clientIds('abc').data).toEqual(['abc'])
	})

	it('splits, trims, drops empties and dedupes', () => {
		expect(clientIds(' a , b,,a, ').data).toEqual(['a', 'b'])
	})

	it.each(['', ' , ,'])('rejects %j', (value) => {
		expect(clientIds(value).success).toBe(false)
	})
})
