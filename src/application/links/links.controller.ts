import {
	Body,
	Controller,
	Get,
	HttpStatus,
	Param,
	Post,
	Req,
} from '@nestjs/common'
import { RouteConfig } from '@nestjs/platform-fastify'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import type { FastifyRequest } from 'fastify'
import { ZodResultResponse } from 'src/common/decorators/zod-result-response.decorator'
import { AppException } from 'src/common/exceptions/app.exception'
import { LinksErrorCodes } from 'src/common/exceptions/error-codes'
import { LoggerService } from 'src/components/logger/logger.service'

import {
	CreateSharableLinkDto,
	CreateSharableLinkResponseDto,
	LinkIdParamDto,
	SharableLinkResponseDto,
} from './dtos/links.dto'
import { LinksRepository } from './links.repository'

@ApiTags('Links')
@Controller()
export class LinksController {
	constructor(
		private readonly linksRepository: LinksRepository,
		private readonly logger: LoggerService,
	) {}

	@ApiOperation({
		summary: 'Get sharable link',
		description: 'Retrieve a sharable link bundle by its ID (public, 24h TTL)',
	})
	@ZodResultResponse({
		status: HttpStatus.OK,
		description: 'Sharable link bundle',
		type: SharableLinkResponseDto,
	})
	@Get('sharable-links/:id')
	async getSharableLink(@Param() params: LinkIdParamDto) {
		const sharableLink = await this.linksRepository.findSharableLink(params.id)

		if (!sharableLink) {
			throw new AppException(
				LinksErrorCodes.SHARABLE_LINK_NOT_FOUND,
				'Sharable link not found or has expired',
				HttpStatus.NOT_FOUND,
			)
		}

		return sharableLink
	}

	@ApiOperation({
		summary: 'Create a sharable link',
		description:
			'Upload a link bundle and receive a share ID. The bundle expires after 24 hours.',
	})
	@ZodResultResponse({
		status: HttpStatus.CREATED,
		description: 'Sharable link created',
		type: CreateSharableLinkResponseDto,
	})
	// Opt this route into the global @fastify/rate-limit plugin (registered with
	// global: false in main.ts). All other routes remain unlimited.
	@RouteConfig({ rateLimit: {} })
	@Post('sharable-links')
	async createSharableLink(
		@Req() req: FastifyRequest,
		@Body() body: CreateSharableLinkDto,
	) {
		this.logger.log('sharable-link-created', { ip: req.ip })
		const id = await this.linksRepository.createSharableLink(body)
		return { id }
	}
}
