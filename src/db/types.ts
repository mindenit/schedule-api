import type { userTable } from './schema/users.js'

type User = typeof userTable.$inferSelect

export type { User }
