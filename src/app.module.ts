import { Module } from '@nestjs/common'
import { CacheModule } from './components/cache/cache.module'
import { ConfigModule } from './components/config/config.module'
import { HealthModule } from './components/health/health.module'
import { DatabaseModule } from './components/database/database.module'
import { ScheduleModule } from '@nestjs/schedule'
import { LoggerModule } from 'nestjs-pino'
import { AuditoriumModule } from './application/auditoriums/auditorium.module'

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

		// Application
		AuditoriumModule,
	],
})
export class AppModule {}
