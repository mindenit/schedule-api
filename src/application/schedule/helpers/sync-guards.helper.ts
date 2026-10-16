// A groups list from CIST smaller than this fraction of the last good list is
// treated as a broken/partial response, not as groups having disappeared.
export const GROUPS_MIN_RATIO = 0.8

// Deleting more than this fraction of all events in one run is far beyond
// normal churn (~0.3%) and points to an incomplete fetch, not real removals.
export const DELETE_MAX_RATIO = 0.2

// CIST has a recurring brief (~5-10min) outage window some nights. A group
// that fails with a FETCH_FAILED (network/server-availability) error is
// deferred and retried once more after the main loop finishes, by which
// point the outage has almost always passed. If more than this fraction of
// groups end up deferred, it's not a brief blip anymore — skip the retry
// pass rather than double the total run time chasing a real outage.
export const MAX_DEFERRED_RATIO = 0.2

// This many FETCH_FAILED groups in a row means CIST is down, not flaky: stop
// the run instead of hammering a dead upstream for hours (15.10: 4h17m).
export const CIRCUIT_BREAKER_CONSECUTIVE_FAILURES = 100

export const exceedsRetryBudget = (
	deferredGroups: number,
	totalGroups: number,
): boolean => deferredGroups > totalGroups * MAX_DEFERRED_RATIO

// A long streak alone may still be a brief outage the retry pass recovers
// from; abort only once the deferred groups can no longer be retried anyway.
export const shouldTripBreaker = (
	streak: number,
	deferredGroups: number,
	totalGroups: number,
): boolean =>
	streak >= CIRCUIT_BREAKER_CONSECUTIVE_FAILURES &&
	exceedsRetryBudget(deferredGroups, totalGroups)

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
