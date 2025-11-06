const HEALTH_CHECK_KEY = 'health-check' as const

const LAST_UPDATE_KEY = 'last-update' as const

const HEALTH_STATUS = {
	UPDATING: 'updating',
	HEALTHY: 'healthy',
	FAILED: 'failed',
}

const IS_UPDATE_IN_PROGRESS_KEY = 'is-update-in-progress' as const

const UPDATE_STATUS = {
	IN_PROGRESS: '1',
	FINISHED: '0',
}

export {
	HEALTH_CHECK_KEY,
	HEALTH_STATUS,
	LAST_UPDATE_KEY,
	IS_UPDATE_IN_PROGRESS_KEY,
	UPDATE_STATUS,
}
