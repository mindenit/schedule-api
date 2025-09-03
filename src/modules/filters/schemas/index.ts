import z from 'zod'
import { eventTypeEnum } from '@/db/schema/event-type-enum.js'

export const FILTER_SCHEMA = z.discriminatedUnion('filter', [
	z.object({
		id: z.number().int().describe('Filter identifier'),
		entityId: z.number().int().describe('Entity identifier'),
		type: z
			.enum(['auditorium', 'teacher', 'group', 'subject'])
			.describe('Type of filter'),
		entity: z.number().int().describe('Indetifier of an entity'),
	}),
	z.object({
		id: z.number().int().describe('Filter identifier'),
		entityId: z.number().int().describe('Entity identifier'),
		type: z
			.enum(['lesson_type', 'teacher', 'group', 'subject'])
			.describe('Type of filter'),
		entity: z.enum(eventTypeEnum.enumValues).describe('Type of an event'),
	}),
])
