import { createHash, timingSafeEqual } from 'node:crypto'

import {
	CanActivate,
	ExecutionContext,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common'
import { ConfigService } from 'src/components/config/config.service'

const hash = (s: string) => createHash('sha256').update(s).digest()

@Injectable()
export class DashKeyGuard implements CanActivate {
	private readonly expected: Buffer

	constructor(private readonly configService: ConfigService) {
		const { apiKey } = this.configService.get('dash')
		this.expected = hash(apiKey)
	}

	canActivate(context: ExecutionContext): boolean {
		const request = context.switchToHttp().getRequest<{
			headers: Record<string, string | undefined>
		}>()
		const provided = request.headers['x-dash-key']

		if (!provided || !timingSafeEqual(hash(provided), this.expected)) {
			throw new UnauthorizedException('Invalid or missing dash key')
		}

		return true
	}
}
