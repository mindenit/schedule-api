import { Injectable } from '@nestjs/common'
import Redis from 'ioredis'

import { ConfigService } from '../config/config.service'

@Injectable()
export class CacheService {
	private cache: Redis

	constructor(private readonly configService: ConfigService) {
		const { port, host, user, password } = this.configService.get('cache')

		this.cache = new Redis({
			port,
			host,
			username: user,
			password: password,
		})
	}

	/*
	 * Gets the Redis cache instance.
	 * @returns {Redis} The Redis cache instance.
	 */
	get(): Redis {
		return this.cache
	}
}
