import { Module } from '@nestjs/common'
import { AuditoriumsRepository } from './auditoriums.repository'
import { AuditoriumsController } from './auditoriums.controller'
import { DatabaseModule } from 'src/components/database/database.module'

@Module({
	imports: [DatabaseModule],
	controllers: [AuditoriumsController],
	providers: [AuditoriumsRepository],
})
export class AudtoriumsModule {}
