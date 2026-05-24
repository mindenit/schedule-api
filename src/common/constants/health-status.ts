export const HEALTH_CHECK_KEY = 'health-check' as const
export const LAST_UPDATE_KEY = 'last-update' as const

export const SYSTEM_HEALTH_STATUS = {
	UPDATING: 'updating',
	HEALTHY: 'healthy',
	FAILED: 'failed',
} as const

export type SystemHealthStatus =
	(typeof SYSTEM_HEALTH_STATUS)[keyof typeof SYSTEM_HEALTH_STATUS]

export const IS_UPDATE_IN_PROGRESS_KEY = 'is-update-in-progress' as const

export const UPDATE_STATUS = {
	IN_PROGRESS: '1',
	FINISHED: '0',
}
