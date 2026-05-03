import { INestApplication } from '@nestjs/common'
import { NestFactory, Reflector } from '@nestjs/core'
import {
	FastifyAdapter,
	NestFastifyApplication,
} from '@nestjs/platform-fastify'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { apiReference } from '@scalar/nestjs-api-reference'
import {
	cleanupOpenApiDoc,
	ZodSerializerInterceptor,
	ZodValidationPipe,
} from 'nestjs-zod'
import { AppModule } from './app.module'
import { GlobalExceptionFilter } from './common/filters/global-exception.filter'
import { ConfigService } from './components/config/config.service'
import { ErrorsInterceptor } from './common/interceptors/error.interceptor'
import { TransformInterceptor } from './common/interceptors/transform.interceptor'
import { Logger } from 'nestjs-pino'

const useSwagger = (app: INestApplication) => {
	const config = new DocumentBuilder()
		.setTitle('Mindenit Hub API')
		.setDescription('API for Mindenit Hub application')
		.setVersion('1.0.0')
		.addTag('API')
		.addSecurity('access-token', {
			type: 'apiKey',
			in: 'cookie',
			name: 'schedule-client-id',
		})
		.addSecurityRequirements('access-token')
		.build()

	const document = SwaggerModule.createDocument(app, config)

	SwaggerModule.setup('api', app, cleanupOpenApiDoc(document))

	app.use(
		'/api',
		apiReference({
			content: document,
			withFastify: true,
			theme: 'deepSpace',
			metaData: {
				title: 'Mindenit Hub API Reference',
				description: '',
			},
		}),
	)
}

async function bootstrap() {
	const app = await NestFactory.create<NestFastifyApplication>(
		AppModule,
		new FastifyAdapter(),
		{
			bufferLogs: true,
			cors: {
				credentials: true,
				methods: ['GET', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
				maxAge: 86_400,
			},
		},
	)

	useSwagger(app)

	const configService = app.get(ConfigService)
	const { port } = configService.get('server')

	app.useLogger(app.get(Logger))
	app.useGlobalFilters(new GlobalExceptionFilter())
	app.useGlobalInterceptors(new ZodSerializerInterceptor(app.get(Reflector)))
	app.useGlobalInterceptors(new ErrorsInterceptor())
	app.useGlobalInterceptors(new TransformInterceptor())
	app.useGlobalPipes(new ZodValidationPipe())

	await app.listen(port)
}

void bootstrap()
