import { randomBytes } from 'node:crypto'

import { ConsoleLogger, Injectable, LogLevel, Scope } from '@nestjs/common'

const errorReplacer = (_key: string, value: unknown): unknown => {
	if (value instanceof Error) {
		return {
			name: value.name,
			message: value.message,
			stack: value.stack,
			...(value.cause !== undefined && { cause: value.cause }),
			// own enumerable props (e.g. AppException.code, AppException.statusCode)
			...value,
		}
	}
	return value
}

@Injectable({ scope: Scope.TRANSIENT })
export class LoggerService extends ConsoleLogger {
	protected printMessages(
		messages: unknown[],
		context?: string,
		level?: LogLevel,
		writeStreamType?: 'stdout' | 'stderr',
	): void {
		const [type, data] = messages
		const logId = randomBytes(6).toString('hex')

		const output = JSON.stringify(
			{
				type: type?.toString() ?? 'unknown',
				data,
				context,
				level,
				logId,
				createdAt: new Date().toISOString(),
			},
			errorReplacer,
			2,
		)

		const streamType = writeStreamType ?? 'stdout'
		const delimiter = '\n\n'

		Reflect.get(process, streamType).write(output)
		Reflect.get(process, streamType).write(delimiter)
	}
}
