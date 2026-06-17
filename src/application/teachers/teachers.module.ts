import { Module } from '@nestjs/common'
import { DatabaseModule } from 'src/components/database/database.module'

import { TeachersController } from './teachers.controller'
import { TeachersRepository } from './teachers.repository'

@Module({
	imports: [DatabaseModule],
	providers: [TeachersRepository],
	controllers: [TeachersController],
})
export class TeachersModule {}
