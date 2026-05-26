import { Module } from '@nestjs/common'
import { GroupsRepository } from './groups.repository'
import { GroupsController } from './groups.controller'
import { DatabaseModule } from 'src/components/database/database.module'

@Module({
	imports: [DatabaseModule],
	providers: [GroupsRepository],
	controllers: [GroupsController],
})
export class GroupsModule {}
