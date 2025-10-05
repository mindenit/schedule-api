import type { LogWriter } from 'drizzle-orm'
import type { CommonDependencies } from '../types/deps.js'
import type { FastifyBaseLogger } from 'fastify'

export class DrizzleWriter implements LogWriter {
	private readonly logger: FastifyBaseLogger

	constructor({ logger }: CommonDependencies) {
		this.logger = logger
	}

	write(message: string): void {
		this.logger.info(message)
	}
}
