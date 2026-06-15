import { Module } from '@nestjs/common'
import { ScheduleModule as NestScheduleModule } from '@nestjs/schedule'
import { AudtoriumsModule } from './application/auditoriums/auditoriums.module'
import { GroupsModule } from './application/groups/groups.module'
import { ScheduleModule } from './application/schedule/schedule.module'
import { TeachersModule } from './application/teachers/teachers.module'
import { CacheModule } from './components/cache/cache.module'
import { ConfigModule } from './components/config/config.module'
import { DatabaseModule } from './components/database/database.module'
import { HealthModule } from './components/health/health.module'
import { LoggerModule } from './components/logger/logger.module'

@Module({
	imports: [
		NestScheduleModule.forRoot(),

		// Components
		ConfigModule,
		CacheModule,
		DatabaseModule,
		HealthModule,
		LoggerModule,

		// Application
		AudtoriumsModule,
		GroupsModule,
		ScheduleModule,
		TeachersModule,
	],
})
export class AppModule {}
