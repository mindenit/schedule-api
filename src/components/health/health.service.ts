import { Inject, Injectable } from '@nestjs/common'
import { Result } from 'better-result'
import Redis from 'ioredis'
import {
	HEALTH_CHECK_KEY,
	LAST_UPDATE_KEY,
	SYSTEM_HEALTH_STATUS,
	SystemHealthStatus,
} from 'src/common/constants/health-status'
import { AppException } from 'src/common/exceptions/app.exception'
import { PromiseResult } from 'src/common/types'
import { attemptAsync } from 'src/common/utils/error-handling'
import { CACHE_CONNECTION_TOKEN } from '../cache/di-tokens'
import { HealthResponse } from './dtos/health.dto'

@Injectable()
export class HealthService {
	constructor(
		@Inject(CACHE_CONNECTION_TOKEN)
		private readonly cache: Redis,
	) {}

	async checkHealth(): PromiseResult<HealthResponse, AppException> {
		const healthResult = await attemptAsync(() =>
			this.cache.get(HEALTH_CHECK_KEY),
		)

		if (healthResult.isErr()) {
			return Result.err(healthResult.error)
		}

		const lastUpdatedResult = await attemptAsync(() =>
			this.cache.get(LAST_UPDATE_KEY),
		)

		if (lastUpdatedResult.isErr()) {
			return Result.err(lastUpdatedResult.error)
		}

		const health = healthResult.unwrap()
		const lastUpdated = lastUpdatedResult.unwrap()

		const data = {
			uptime: process.uptime(),
		}

		if (!health || !lastUpdated) {
			if (!health) {
				await this.cache.set(HEALTH_CHECK_KEY, SYSTEM_HEALTH_STATUS.HEALTHY)
			}

			if (!lastUpdated) {
				await this.cache.set(LAST_UPDATE_KEY, new Date().toISOString())
			}

			return Result.ok({
				...data,
				status: this.isSystemHealthStatus(health)
					? health
					: SYSTEM_HEALTH_STATUS.HEALTHY,
				lastUpdated: lastUpdated ?? new Date().toISOString(),
			})
		}

		return Result.ok({
			...data,
			status: this.isSystemHealthStatus(health)
				? health
				: SYSTEM_HEALTH_STATUS.HEALTHY,
			lastUpdated,
		})
	}

	/*
	 * Checks if the given value is a valid system health status.
	 * @param {unknown} value The value to check.
	 * @returns {boolean} true if the value is a valid system health status, false otherwise.
	 */
	private isSystemHealthStatus(value: unknown): value is SystemHealthStatus {
		if (typeof value !== 'string') {
			return false
		}

		return Object.values(SYSTEM_HEALTH_STATUS).includes(value)
	}
}
