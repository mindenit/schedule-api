import { App } from './app.js'

const bootstrap = async () => {
	const port = 8080 as const

	try {
		const app = new App()
		const server = await app.initialize()

		server.listen({ port, host: '0.0.0.0' })

		console.log(`Server is running on port ${port}`)
	} catch (e: unknown) {
		console.warn(e)
		process.exit(1)
	}
}

void bootstrap()
