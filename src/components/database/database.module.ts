import { Module, Provider } from '@nestjs/common'
import { DATABASE_CONNECTION_TOKEN } from './di-tokens'
import { DatabaseService } from './database.service'
import { ConfigModule } from '../config/config.module'
import { LoggerModule } from '../logger/logger.module'

const databaseConnectionProvider = {
	provide: DATABASE_CONNECTION_TOKEN,
	useFactory: (databaseService: DatabaseService) => databaseService.get(),
	inject: [DatabaseService],
} satisfies Provider

@Module({
	imports: [ConfigModule, LoggerModule],
	providers: [DatabaseService, databaseConnectionProvider],
	exports: [DATABASE_CONNECTION_TOKEN],
})
export class DatabaseModule {}
