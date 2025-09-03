import type { Maybe } from '@/core/types/common.js'
import NodeClient from '@logto/node'
import type {
	FastifyPluginAsync,
	FastifyReply,
	FastifyRequest,
	RouteOptions,
} from 'fastify'
import { FastifyStorage } from './storage.js'
import type { CustomLogtoConfig, RequestMethod } from './types.js'
import { prepareBasicAuthHeader } from './utils.js'
import fp from 'fastify-plugin'
import type { FastifyLogtoContext } from '@albirex/fastify-logto'

const PREFIX = 'api/auth'

const initClient = async (
	request: FastifyRequest,
	reply: FastifyReply,
	config: CustomLogtoConfig,
) => {
	const storage = new FastifyStorage(request)

	return new NodeClient(config, {
		storage,
		navigate: async (url: string) => {
			await reply.redirect(url)
		},
	})
}

const registerLogto: FastifyPluginAsync<CustomLogtoConfig> = async (
	fastify,
	config,
) => {
	let token: Maybe<string>

	fastify.decorate('logto', {
		async getToken() {
			const response = await fetch(`${config.endpoint}/oidc/token`, {
				method: 'POST',
				headers: {
					Authorization: prepareBasicAuthHeader(config),
				},
				body: new URLSearchParams({
					grant_type: 'client_credentials',
					scope: 'all',
					resource: 'https://default.logto.app/api',
				}),
			})

			if (!response.ok) {
				throw response
			}

			const body = (await response.json()) as { access_token: string }
			token = body.access_token

			return token
		},
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		async callAPI(url: string, method: RequestMethod, body?: Maybe<any>) {
			if (!token) {
				await fastify.logto.getToken()
			}

			const response = await fetch(`${config.endpoint}${url}`, {
				method,
				headers: {
					Authorization: `Bearer ${token}`,
					'content-type': 'application/json',
				},
				body,
			})

			if (!response.ok) {
				if (response.status === 401) {
					const errorBody = (await response.json()) as { code: string }

					if (errorBody.code === 'ERR_JWT_EXPIRED') {
						await fastify.logto.getToken()
						return fastify.logto.callAPI(url, method, body)
					}
				}

				throw response
			}

			return response
		},
	})

	fastify.decorate('protectedRoute', (options: RouteOptions) => {
		return fastify.route({
			...options,
			preHandler: (request: FastifyRequest, response: FastifyReply) => {
				if (!request.logToUser?.isAuthenticated) {
					return response.redirect(`${PREFIX}/sign-in`)
				}
			},
		})
	})

	fastify.get(
		`/${PREFIX}/:action`,
		async (
			request: FastifyRequest<{ Params: { action: string } }>,
			reply: FastifyReply,
		) => {
			const { action } = request.params
			const nodeClient = await initClient(request, reply, config)
			switch (action) {
				case 'sign-in': {
					await nodeClient.signIn({
						redirectUri: `${config.baseUrl}/${PREFIX}/sign-in-callback`,
					})
					break
				}

				case 'sign-up': {
					await nodeClient.signIn({
						redirectUri: `${config.baseUrl}/${PREFIX}/sign-in-callback`,
						firstScreen: 'register',
					})
					break
				}

				case 'sign-in-callback': {
					if (request.raw.url) {
						await nodeClient.handleSignInCallback(
							`${config.baseUrl}${request.raw.url}`,
						)
						return reply.redirect(config.baseUrl ?? '')
					}
					break
				}

				case 'sign-out': {
					await nodeClient.signOut(config.baseUrl)
					break
				}

				default: {
					return reply.status(404).send()
				}
			}
		},
	)

	fastify.decorateRequest('logToUser')

	fastify.addHook(
		'preHandler',
		async (request: FastifyRequest, reply: FastifyReply) => {
			const client = await initClient(request, reply, config)

			const user = await client.getContext({
				getAccessToken: config.getAccessToken,
				resource: config.resource,
				fetchUserInfo: config.fetchUserInfo,
				getOrganizationToken: config.getOrganizationToken,
			})

			if (await client.isAuthenticated()) {
				const at = await client.getAccessTokenClaims(
					'https://default.logto.app/api',
				)
				request.logToUser = { ...user, accessTokenClaims: at.scope?.split(' ') }
			} else {
				request.logToUser = { ...user }
			}
		},
	)
}

const customLogtoAdapter = fp(registerLogto, {
	name: 'awesome-logto',
})

export { customLogtoAdapter }

export type LogToFastifyInstance = {
	getToken: () => Promise<string>
	callAPI: (
		url: string,
		method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		body?: any | null,
	) => Promise<Response>
}

declare module 'fastify' {
	interface FastifyInstance {
		logto: LogToFastifyInstance
		protectedRoute: (options: RouteOptions) => FastifyInstance
	}
	interface FastifyRequest {
		logToUser?: FastifyLogtoContext
	}
}
