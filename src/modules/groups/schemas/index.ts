import { z } from 'zod'

const GROUP_SCHEMA = z.object({
	id: z.number().int().describe('Group identifier'),
	name: z.string().describe('Name of group'),
	directionId: z
		.number()
		.int()
		.nullable()
		.describe('Identifer of direction group belongs to'),
	specialityId: z
		.number()
		.int()
		.nullable()
		.describe('Identifier of speciality group belongs to'),
})

const SUBJECT_SCHEMA = z.object({
	id: z.number().int().describe('Subject identifier'),
	brief: z.string().describe('Subject brief name'),
	name: z.string().describe('Subject name'),
})

export { GROUP_SCHEMA, SUBJECT_SCHEMA }
