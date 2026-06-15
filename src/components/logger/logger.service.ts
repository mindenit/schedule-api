import { ConsoleLogger, Injectable, LogLevel, Scope } from '@nestjs/common'
import { randomBytes } from 'node:crypto'

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
			null,
			2,
		)

		const streamType = writeStreamType ?? 'stdout'
		const delimiter = '\n\n'

		Reflect.get(process, streamType).write(output)
		Reflect.get(process, streamType).write(delimiter)
	}
}
