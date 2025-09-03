import type { Storage, PersistKey } from '@logto/node'
import type { FastifyRequest } from 'fastify'

export class FastifyStorage implements Storage<PersistKey> {
	constructor(private readonly request: FastifyRequest) {}

	async setItem(key: PersistKey, value: string) {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		this.request.session.set<any>(key, value)
	}

	async getItem(key: PersistKey) {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const value = this.request.session.get<any>(key)

		if (value === undefined) {
			return null
		}

		return String(value)
	}

	async removeItem(key: PersistKey) {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		this.request.session.set<any>(key, undefined)
	}
}
