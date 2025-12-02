import type { Routes } from '@/core/types/routes.js'
import {
	generateFailureResponseSchema,
	generateSuccessResponseSchema,
} from '@/core/utils/schemas.js'
import {
	acceptSharableLink,
	createLink,
	createSharableLink,
	deleteLink,
	getSharableLink,
	getUserLinks,
	updateLink,
} from '../handlers/index.js'
import { sessionMiddleware } from '../middlewares/session.js'
import {
	CREATE_LINK_SCHEMA,
	CREATE_SHARABLE_LINK_SCHEMA,
	GET_LINK_BY_ID_SCHEMA,
	LINK_SCHEMA,
	SHARABLE_LINK_SCHEMA,
	UPDATE_LINK_SCHEMA,
} from '../schemas/index.js'
import { z } from 'zod'

export const getLinksRoutes = (): Routes => ({
	routes: [
		{
			method: 'GET',
			url: '/links',
			handler: getUserLinks,
			preHandler: [sessionMiddleware],
			schema: {
				message: 'Get user links',
				summary: 'Retrieve all links for the user',
				tags: ['Links'],
				security: [{ CookieAuth: [] }],
				response: {
					200: generateSuccessResponseSchema(LINK_SCHEMA.array()).describe(
						'List of user links',
					),
					401: generateFailureResponseSchema(401).describe(
						'Unauthorized, session cookie is missing',
					),
				},
			},
		},
		{
			method: 'GET',
			url: '/sharable-links/:id',
			handler: getSharableLink,
			schema: {
				summary: 'Get sharable link',
				description: 'Retrieve a sharable link by its ID',
				tags: ['Sharable Links'],
				params: GET_LINK_BY_ID_SCHEMA,
				response: {
					200: generateSuccessResponseSchema(SHARABLE_LINK_SCHEMA).describe(
						'Sharable link details',
					),
					404: generateFailureResponseSchema(404).describe(
						'Sharable link not found',
					),
				},
			},
		},
		{
			method: 'POST',
			url: '/links',
			handler: createLink,
			preHandler: [sessionMiddleware],
			schema: {
				summary: 'Create a new link',
				description: 'Create a new link for a particular subject',
				tags: ['Links'],
				body: CREATE_LINK_SCHEMA,
				security: [{ CookieAuth: [] }],
				response: {
					201: generateSuccessResponseSchema(LINK_SCHEMA).describe(
						'Link successfully created',
					),
					401: generateFailureResponseSchema(401).describe(
						'Unauthorized, session cookie is missing',
					),
				},
			},
		},
		{
			method: 'POST',
			url: '/sharable-links',
			handler: createSharableLink,
			preHandler: [sessionMiddleware],
			schema: {
				summary: 'Create a sharable link',
				description: 'Create a sharable link with multiple links',
				tags: ['Sharable Links'],
				body: CREATE_SHARABLE_LINK_SCHEMA,
				security: [{ CookieAuth: [] }],
				response: {
					201: generateSuccessResponseSchema(
						z.object({
							id: z.uuid(),
						}),
					).describe('Sharable link successfully created'),
					401: generateFailureResponseSchema(401).describe(
						'Unauthorized, session cookie is missing',
					),
				},
			},
		},
		{
			method: 'PUT',
			url: '/links/:id',
			handler: updateLink,
			preHandler: [sessionMiddleware],
			schema: {
				summary: 'Update an existing link',
				description: 'Update the details of an existing link',
				tags: ['Links'],
				params: GET_LINK_BY_ID_SCHEMA,
				body: UPDATE_LINK_SCHEMA,
				security: [{ CookieAuth: [] }],
				response: {
					200: generateSuccessResponseSchema(LINK_SCHEMA).describe(
						'Link successfully updated',
					),
					401: generateFailureResponseSchema(401).describe(
						'Unauthorized, session cookie is missing',
					),
					404: generateFailureResponseSchema(404).describe('Link not found'),
				},
			},
		},
		{
			method: 'PUT',
			url: '/sharable-links/:id/accept',
			handler: acceptSharableLink,
			preHandler: [sessionMiddleware],
			schema: {
				summary: 'Accept a sharable link',
				description: 'Accept a sharable link by its ID',
				tags: ['Sharable Links'],
				params: GET_LINK_BY_ID_SCHEMA,
				security: [{ CookieAuth: [] }],
				response: {
					400: generateFailureResponseSchema(400).describe(
						'You have already accepted this sharable link',
					),
					404: generateFailureResponseSchema(404).describe(
						'Sharable link not found',
					),
				},
			},
		},
		{
			method: 'DELETE',
			url: '/links/:id',
			handler: deleteLink,
			preHandler: [sessionMiddleware],
			schema: {
				summary: 'Delete a link',
				description: 'Delete a link by its ID',
				tags: ['Links'],
				params: GET_LINK_BY_ID_SCHEMA,
				security: [{ CookieAuth: [] }],
				response: {
					200: generateSuccessResponseSchema(LINK_SCHEMA).describe(
						'Link successfully updated',
					),
					401: generateFailureResponseSchema(401).describe(
						'Unauthorized, session cookie is missing',
					),
					404: generateFailureResponseSchema(404).describe('Link not found'),
				},
			},
		},
	],
})
