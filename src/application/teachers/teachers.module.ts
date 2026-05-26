import { Module } from '@nestjs/common'
import { TeachersRepository } from './teachers.repository'
import { TeachersController } from './teachers.controller'
import { DatabaseModule } from 'src/components/database/database.module'

@Module({
	imports: [DatabaseModule],
	providers: [TeachersRepository],
	controllers: [TeachersController],
})
export class TeachersModule {}
