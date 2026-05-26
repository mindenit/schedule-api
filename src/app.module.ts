import { Module } from '@nestjs/common'
import { ScheduleModule as NestScheduleModule } from '@nestjs/schedule'
import { LoggerModule } from 'nestjs-pino'
import { AudtoriumsModule } from './application/auditoriums/auditoriums.module'
import { GroupsModule } from './application/groups/groups.module'
import { ScheduleModule } from './application/schedule/schedule.module'
import { TeachersModule } from './application/teachers/teachers.module'
import { CacheModule } from './components/cache/cache.module'
import { ConfigModule } from './components/config/config.module'
import { DatabaseModule } from './components/database/database.module'
import { HealthModule } from './components/health/health.module'

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
		NestScheduleModule.forRoot(),

		// Components
		ConfigModule,
		CacheModule,
		DatabaseModule,
		HealthModule,

		// Application
		AudtoriumsModule,
		GroupsModule,
		ScheduleModule,
		TeachersModule,
	],
})
export class AppModule {}
