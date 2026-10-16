import { describe, expect, it } from 'vitest'

import {
	CIRCUIT_BREAKER_CONSECUTIVE_FAILURES,
	exceedsDeleteRatio,
	getGroupsListError,
	nextFetchFailureStreak,
} from './sync-guards.helper'

describe('getGroupsListError', () => {
	it('rejects an empty list with or without a previous run', () => {
		expect(getGroupsListError(0, null)).toBe('groups list is empty')
		expect(getGroupsListError(0, 1000)).toBe('groups list is empty')
	})

	it('rejects a list below 80% of the last good one', () => {
		expect(getGroupsListError(799, 1000)).toBe(
			'groups list too small: 799 < 80% of 1000',
		)
	})

	it('accepts a list exactly at or above the threshold', () => {
		expect(getGroupsListError(800, 1000)).toBeNull()
		expect(getGroupsListError(1200, 1000)).toBeNull()
	})

	it('accepts any non-empty list without a previous good run', () => {
		expect(getGroupsListError(1, null)).toBeNull()
		expect(getGroupsListError(1, 0)).toBeNull()
	})
})

describe('nextFetchFailureStreak', () => {
	const run = (outcomes: boolean[]) =>
		outcomes.reduce(nextFetchFailureStreak, 0)

	it('counts consecutive fetch failures up to the breaker threshold', () => {
		const failures = Array<boolean>(CIRCUIT_BREAKER_CONSECUTIVE_FAILURES).fill(
			true,
		)

		expect(run(failures.slice(1))).toBe(
			CIRCUIT_BREAKER_CONSECUTIVE_FAILURES - 1,
		)
		expect(run(failures)).toBe(CIRCUIT_BREAKER_CONSECUTIVE_FAILURES)
	})

	it('resets on any other outcome', () => {
		expect(run([true, true, false])).toBe(0)
		expect(run([true, false, true])).toBe(1)
	})
})

describe('exceedsDeleteRatio', () => {
	it('allows deletes up to and including 20%', () => {
		expect(exceedsDeleteRatio(0, 1000)).toBe(false)
		expect(exceedsDeleteRatio(200, 1000)).toBe(false)
	})

	it('blocks deletes above 20%', () => {
		expect(exceedsDeleteRatio(201, 1000)).toBe(true)
		expect(exceedsDeleteRatio(1000, 1000)).toBe(true)
	})

	it('never blocks when there are no events', () => {
		expect(exceedsDeleteRatio(0, 0)).toBe(false)
	})
})
