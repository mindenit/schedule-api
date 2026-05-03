import { Module } from '@nestjs/common'
import { CacheModule } from './components/cache/cache.module'
import { ConfigModule } from './components/config/config.module'
import { HealthModule } from './components/health/health.module'
import { DatabaseModule } from './components/database/database.module'
import { ScheduleModule } from '@nestjs/schedule'
import { LoggerModule } from 'nestjs-pino'

@Module({
	imports: [
		LoggerModule.forRoot({
			pinoHttp: {
				transport:
					process.env.NODE_ENV !== 'production'
						? { target: 'pino-pretty' }
						: undefined,
			},
		}),
		ScheduleModule.forRoot(),

		// Components
		ConfigModule,
		CacheModule,
		DatabaseModule,
		HealthModule,
	],
})
export class AppModule {}
