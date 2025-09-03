import {
	HEALTH_CHECK_KEY,
	HEALTH_STATUS,
	LAST_UPDATE_KEY,
	SCHEDULE_TYPE,
} from '@/core/constants/index.js'
import type { AppInstance } from '@/core/types/common.js'
import { delay } from '@/core/utils/index.js'

export const cistPostmanJob = async (app: AppInstance): Promise<void> => {
	const {
		auditoriumsProcessor,
		groupsProcessor,
		eventsProcessor,
		teachersProcessor,
		logger,
		cache,
	} = app.diContainer.cradle

	try {
		await cache.set(HEALTH_CHECK_KEY, HEALTH_STATUS.UPDATING)

		logger.info('Start CIST Postman')

		const [auditoriums, groups, teachers] = await Promise.all([
			auditoriumsProcessor.process(),
			groupsProcessor.process(),
			teachersProcessor.process(),
		])

		if (!auditoriums || !groups || !teachers) {
			return
		}

		logger.info('Start filling events')

		for (const group of groups) {
			await eventsProcessor.process(group.id, SCHEDULE_TYPE.GROUP)

			delay(3000)
		}

		await Promise.all([
			eventsProcessor.removeExtraEvents(),
			cache.set(HEALTH_CHECK_KEY, HEALTH_STATUS.HEALTHY),
		])

		logger.info('Job completed sucessfully')
	} catch {
		await cache.set(HEALTH_CHECK_KEY, HEALTH_STATUS.FAILED)

		logger.error('Job failed')
	} finally {
		await cache.set(LAST_UPDATE_KEY, new Date().toISOString())
	}
}
