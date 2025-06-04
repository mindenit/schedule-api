import type { Routes } from '@/core/types/routes.js'
import { createUser, getUsers } from '../handlers/index.js'
import { CREATE_USER_SCHEMA } from '../schemas/index.js'

export const getUsersRoutes = (): Routes => ({
	routes: [
		{
			method: 'GET',
			url: '/users',
			handler: getUsers,
		},
		{
			method: 'POST',
			url: '/users',
			handler: createUser,
			schema: {
				body: CREATE_USER_SCHEMA,
			},
		},
	],
})
