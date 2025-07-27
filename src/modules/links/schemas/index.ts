import { eventTypeEnum } from '@/db/schema/event-type-enum.js'
import { z } from 'zod'

const LINK_SCHEMA = z.object({
	id: z.string().uuid().describe('Unique identifier for the link'),
	label: z.string().nonempty().max(64).describe('Label for the link'),
	url: z.string().url().describe('URL of the link'),
	type: z.enum(eventTypeEnum.enumValues).describe('Type of the link'),
	subjectId: z
		.number()
		.int()
		.describe('Identifier of the subject associated with the link'),
	userId: z.string().uuid(),
})

type Link = z.infer<typeof LINK_SCHEMA>

const SHARABLE_LINK_SCHEMA = z.object({
	id: z.string().uuid().describe('Unique identifier for the sharable link'),
	links: LINK_SCHEMA.array().describe('Array of URLs to be shared'),
})

const CREATE_LINK_SCHEMA = LINK_SCHEMA.omit({ id: true, userId: true })

type CREATE_LINK = z.infer<typeof CREATE_LINK_SCHEMA>

const GET_LINK_BY_ID_SCHEMA = LINK_SCHEMA.pick({ id: true })

type GET_LINK_BY_ID = z.infer<typeof GET_LINK_BY_ID_SCHEMA>

const UPDATE_LINK_SCHEMA = LINK_SCHEMA.partial().pick({
	label: true,
	url: true,
})

type UPDATE_LINK = z.infer<typeof UPDATE_LINK_SCHEMA>

export {
	LINK_SCHEMA,
	SHARABLE_LINK_SCHEMA,
	CREATE_LINK_SCHEMA,
	UPDATE_LINK_SCHEMA,
	GET_LINK_BY_ID_SCHEMA,
}
export type { Link, CREATE_LINK, UPDATE_LINK, GET_LINK_BY_ID }
