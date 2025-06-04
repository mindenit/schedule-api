import { DUPLICATE_KEY_ERR_CODE } from '@/core/constants/db.js'
import { INTERNAL_SERVER_ERR } from '@/core/constants/index.js'
import type { HttpError } from '@/core/types/common.js'
import { Failure, Success, type Result } from '@/core/utils/result.js'
import { userTable } from '@/db/schema/users.js'
import type { User } from '@/db/types.js'
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { USER_ALREADY_EXISTS_ERR } from '../constants/index.js'
import type { CREATE_USER_TYPE } from '../schemas/index.js'
import type {
	IUsersRepository,
	UsersInjectableDependencies,
} from '../types/index.js'

export class UsersRepository implements IUsersRepository {
	private readonly db: PostgresJsDatabase

	constructor({ db }: UsersInjectableDependencies) {
		this.db = db.client
	}

	async findAll(): Promise<User[]> {
		return this.db.select().from(userTable)
	}

	async createOne({
		name,
	}: CREATE_USER_TYPE): Promise<Result<User, HttpError>> {
		try {
			const [user] = await this.db
				.insert(userTable)
				.values({ name })
				.returning()

			return Success(user!)
		} catch (e: unknown) {
			if (
				e instanceof postgres.PostgresError &&
				e.code === DUPLICATE_KEY_ERR_CODE
			) {
				return Failure(USER_ALREADY_EXISTS_ERR)
			}

			return Failure(INTERNAL_SERVER_ERR)
		}
	}
}
