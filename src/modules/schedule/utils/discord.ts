export const pingDiscordWebhook = async (
	webhookUrl: string,
	message: string,
): Promise<void> => {
	await fetch(webhookUrl, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			content: message,
		}),
	})
}
