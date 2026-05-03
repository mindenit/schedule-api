import { ZodDto, ZodResponse } from 'nestjs-zod'

type AnyZodDto = ZodDto<ZodDto['schema'], false>

type ZodResultResponseOptions = {
	status?: number
	description?: string
	type: AnyZodDto | [AnyZodDto]
}

type SingleOptions = { status?: number; description?: string; type: AnyZodDto }

export const ZodResultResponse = (
	options: ZodResultResponseOptions,
): MethodDecorator => ZodResponse(options as SingleOptions) as MethodDecorator
