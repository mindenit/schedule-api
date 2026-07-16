import { createZodDto } from 'nestjs-zod'
import { getSuccessResponseSchema } from 'src/common/schemas/response.schema'
import { z } from 'zod'

import {
	CreateSharableLinkSchema,
	LinkIdParamSchema,
	SharableLinkSchema,
} from '../links.schema'

export class LinkIdParamDto extends createZodDto(LinkIdParamSchema) {}

export class SharableLinkResponseDto extends createZodDto(
	getSuccessResponseSchema(SharableLinkSchema),
) {}

export class CreateSharableLinkResponseDto extends createZodDto(
	getSuccessResponseSchema(z.object({ id: z.string().uuid() })),
) {}

export class CreateSharableLinkDto extends createZodDto(
	CreateSharableLinkSchema,
) {}
