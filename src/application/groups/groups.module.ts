import { Module } from '@nestjs/common'
import { DatabaseModule } from 'src/components/database/database.module'

import { GroupsController } from './groups.controller'
import { GroupsRepository } from './groups.repository'

@Module({
	imports: [DatabaseModule],
	providers: [GroupsRepository],
	controllers: [GroupsController],
})
export class GroupsModule {}
