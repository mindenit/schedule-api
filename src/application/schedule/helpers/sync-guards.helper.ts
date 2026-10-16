// A groups list from CIST smaller than this fraction of the last good list is
// treated as a broken/partial response, not as groups having disappeared.
export const GROUPS_MIN_RATIO = 0.8

// Deleting more than this fraction of all events in one run is far beyond
// normal churn (~0.3%) and points to an incomplete fetch, not real removals.
export const DELETE_MAX_RATIO = 0.2

// This many FETCH_FAILED groups in a row means CIST is down, not flaky: stop
// the run instead of hammering a dead upstream for hours (15.10: 4h17m).
export const CIRCUIT_BREAKER_CONSECUTIVE_FAILURES = 100

// Any outcome other than a fetch failure (success, parse error) proves CIST
// answered, so it resets the streak.
export const nextFetchFailureStreak = (
	streak: number,
	fetchFailed: boolean,
): number => (fetchFailed ? streak + 1 : 0)

// Returns an error message when the fetched groups list is too small to trust.
// Without a previous good list only an empty one is rejected.
export const getGroupsListError = (
	count: number,
	lastGoodCount: number | null,
): string | null => {
	if (count === 0) return 'groups list is empty'
	if (lastGoodCount && count < lastGoodCount * GROUPS_MIN_RATIO) {
		return `groups list too small: ${count} < ${GROUPS_MIN_RATIO * 100}% of ${lastGoodCount}`
	}
	return null
}

export const exceedsDeleteRatio = (
	staleEvents: number,
	totalEvents: number,
): boolean => totalEvents > 0 && staleEvents / totalEvents > DELETE_MAX_RATIO
