import type { CustomLogtoConfig } from './types.js'

export const prepareBasicAuthHeader = (
	config: Pick<CustomLogtoConfig, 'appId' | 'appSecret'>,
): string => {
	return `Basic ${Buffer.from(`${config.appId}:${config.appSecret}`).toString('base64')}`
}
