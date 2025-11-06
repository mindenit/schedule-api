import { App } from './app.js'
import { isDbEmpty, isScheduleUpdating } from './core/utils/index.js'
import { cistPostmanJob } from './modules/schedule/jobs/postman.js'

const bootstrap = async () => {
	const port = 8080 as const

	try {
		const app = new App()
		const server = await app.initialize()

		server.listen({ port, host: '0.0.0.0' })

		console.log(`Server is running on port ${port}`)

		const [isEmpty, isUpdating] = await Promise.all([
			isDbEmpty(server.diContainer.cradle.db.client),
			isScheduleUpdating(server.diContainer.cradle.cache),
		])

		if (isEmpty || isUpdating) {
			await cistPostmanJob(server)
		}
	} catch (e: unknown) {
		console.warn(e)
		process.exit(1)
	}
}

void bootstrap()
