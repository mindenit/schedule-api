import type { RouteOptions } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import type http from 'node:http'

type Route = RouteOptions<
	http.Server,
	http.IncomingMessage,
	http.ServerResponse,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	any,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	any,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	any,
	ZodTypeProvider
>

interface Routes {
	routes: Route[]
}

export type { Routes }
