// The crawler embeds the full request URL (incl. the CIST API key) into
// fetch error messages; these end up in sync_run_group.error, logs and webhooks.
export const redactClientId = (message: string): string =>
	message.replaceAll(/(idClient(?:=|%3D)\s*)[^&\s:"]+/gi, '$1***')
