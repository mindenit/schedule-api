import { ZodDto, ZodResponse } from 'nestjs-zod'

type AnyZodDto = ZodDto<ZodDto['schema'], false>

interface ZodResultResponseOptions {
	status?: number
	description?: string
	type: AnyZodDto | [AnyZodDto]
}

interface SingleOptions {
	status?: number
	description?: string
	type: AnyZodDto
}

export const ZodResultResponse = (
	options: ZodResultResponseOptions,
): MethodDecorator => ZodResponse(options as SingleOptions) as MethodDecorator
