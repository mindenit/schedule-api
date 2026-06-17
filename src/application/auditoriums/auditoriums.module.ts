import { Module } from '@nestjs/common'
import { DatabaseModule } from 'src/components/database/database.module'

import { AuditoriumsController } from './auditoriums.controller'
import { AuditoriumsRepository } from './auditoriums.repository'

@Module({
	imports: [DatabaseModule],
	controllers: [AuditoriumsController],
	providers: [AuditoriumsRepository],
})
export class AudtoriumsModule {}
