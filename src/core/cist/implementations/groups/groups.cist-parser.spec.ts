import CistCrawler from '@mindenit/cist-crawler'
import { describe, expect, it } from 'vitest'

import { CistGroupsParser } from './groups.cist-parser'

const names = (id: number) => ({
	id,
	full_name: `Full ${id}`,
	short_name: `S${id}`,
})

const crawler = {
	getGroups: () =>
		Promise.resolve({
			university: {
				full_name: 'University',
				short_name: 'U',
				faculties: [
					{
						...names(1),
						directions: [
							{
								...names(10),
								specialities: [
									{
										...names(100),
										groups: [
											{ id: 1000, name: 'A-1' },
											{ id: 1001, name: 'A-2' },
										],
									},
								],
								groups: [
									{ id: 1000, name: 'A-1' },
									{ id: 1002, name: 'B-1' },
								],
							},
						],
					},
				],
			},
		}),
} as unknown as CistCrawler

describe('CistGroupsParser', () => {
	it('dedupes groups listed under both speciality and direction', async () => {
		const { groups } = (await new CistGroupsParser(crawler).parse()).unwrap()

		expect(groups).toEqual([
			{ id: 1000, name: 'A-1', directionId: 10, specialityId: 100 },
			{ id: 1001, name: 'A-2', directionId: 10, specialityId: 100 },
			{ id: 1002, name: 'B-1', directionId: 10, specialityId: null },
		])
	})
})
