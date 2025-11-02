import {
	HEALTH_CHECK_KEY,
	HEALTH_STATUS,
	LAST_UPDATE_KEY,
	SCHEDULE_TYPE,
} from '@/core/constants/index.js'
import type { AppInstance } from '@/core/types/common.js'
import { delay } from '@/core/utils/index.js'
import { pingDiscordWebhook } from '../utils/discord.js'

export const cistPostmanJob = async (app: AppInstance): Promise<void> => {
	const {
		auditoriumsProcessor,
		groupsProcessor,
		eventsProcessor,
		teachersProcessor,
		logger,
		cache,
		config,
	} = app.diContainer.cradle

	try {
		await cache.set(HEALTH_CHECK_KEY, HEALTH_STATUS.UPDATING)

		logger.info('[Cist Postman]: Start CIST Postman')

		const [auditoriums, groups, teachers] = await Promise.all([
			auditoriumsProcessor.process(),
			groupsProcessor.process(),
			teachersProcessor.process(),
		])

		if (!auditoriums || !groups || !teachers) {
			return
		}

		logger.info('[Cist Postman]: Start filling events')

		const totalGroups = groups.length

		for (let i = 0; i < groups.length; i++) {
			logger.info(
				`[Cist Postman]: Processing group ${i + 1}/${totalGroups} with id ${groups[i]!.id}`,
			)

			const group = groups[i]!

			await eventsProcessor.process(group.id, SCHEDULE_TYPE.GROUP)

			await delay(8000)
		}

		await Promise.all([
			// eventsProcessor.removeExtraEvents(),
			cache.set(HEALTH_CHECK_KEY, HEALTH_STATUS.HEALTHY),
		])

		logger.info('[Cist Postman]: Job completed sucessfully')
	} catch (e: unknown) {
		await cache.set(HEALTH_CHECK_KEY, HEALTH_STATUS.FAILED)

		logger.error('[Cist Postman]: Job failed')
		logger.error(e)

		const errMessage = `:warning: CIST Postman job failed!\n\`\`\`${e instanceof Error ? e.message : 'Unknown error'}\`\`\``

		await pingDiscordWebhook(config.integration.discordWebhookUrl, errMessage)
	} finally {
		await cache.set(LAST_UPDATE_KEY, new Date().toISOString())
	}
}
