import type { FastifyInstance } from 'fastify'
import type http from 'node:http'

type AppInstance = FastifyInstance<
	http.Server,
	http.IncomingMessage,
	http.ServerResponse
>

interface HttpError {
	status: number
	message: string
}

export type { AppInstance, HttpError }
