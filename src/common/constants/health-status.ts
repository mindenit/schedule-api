export const SYSTEM_HEALTH_STATUS = {
	UPDATING: 'updating',
	HEALTHY: 'healthy',
	FAILED: 'failed',
} as const

export type SystemHealthStatus =
	(typeof SYSTEM_HEALTH_STATUS)[keyof typeof SYSTEM_HEALTH_STATUS]
