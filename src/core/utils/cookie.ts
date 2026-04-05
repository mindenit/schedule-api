import type { CookieSerializeOptions } from '@fastify/cookie'
import type { FastifyReply } from 'fastify'

interface SetCookieArgs {
	name: string
	value: string
	expiresAt: Date
}

const SHARED_COOKIE_OPTIONS: CookieSerializeOptions = {
	httpOnly: true,
	sameSite: 'lax',
	path: '/',
}

const setCookie = ({ name, value, expiresAt }: SetCookieArgs) => {
	return (reply: FastifyReply): void => {
		reply.setCookie(name, value, {
			...SHARED_COOKIE_OPTIONS,
			expires: expiresAt,
			secure: process.env.NODE_ENV === 'production',
		})
	}
}

const clearCookie = (name: string) => {
	return (reply: FastifyReply): void => {
		reply.clearCookie(name, {
			...SHARED_COOKIE_OPTIONS,
			secure: process.env.NODE_ENV === 'production',
		})
	}
}

export { setCookie, clearCookie }
