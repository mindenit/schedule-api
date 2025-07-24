import type { Redis } from 'ioredis'

export const scanKeys = async (
	redis: Redis,
	pattern: string,
): Promise<string[]> => {
	let cursor = '0'
	const keys: string[] = []

	do {
		const result = await redis.scan(cursor, 'MATCH', pattern, 'COUNT', '1000')
		cursor = result[0]
		keys.push(...result[1])
	} while (cursor !== '0')

	return keys
}
