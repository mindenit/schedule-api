import type { GetContextParameters, LogtoConfig } from '@logto/node'

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

type CustomLogtoConfig = LogtoConfig & {
	baseUrl: string
	appId: string
	appSecret: string
} & GetContextParameters

export type { CustomLogtoConfig, RequestMethod }
