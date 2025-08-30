const HEALTH_CHECK_KEY = 'health-check' as const

const LAST_UPDATE_KEY = 'last-update' as const

const HEALTH_STATUS = {
	UPDATING: 'updating',
	HEALTHY: 'healthy',
	FAILED: 'failed',
}

export { HEALTH_CHECK_KEY, HEALTH_STATUS, LAST_UPDATE_KEY }
