import { Injectable } from '@nestjs/common'
import { ConfigService } from '../config/config.service'
import Redis from 'ioredis'

@Injectable()
export class CacheService {
	private _cache: Redis

	constructor(private readonly configService: ConfigService) {
		const { port, host, user, password } = this.configService.get('cache')

		this._cache = new Redis({
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
	get cache(): Redis {
		return this._cache
	}
}
