import { eventTypeEnum } from 'src/db/schema/event-type-enum'
import { z } from 'zod'

/** Maximum number of links allowed across an entire sharable bundle */
export const MAX_LINKS_PER_BUNDLE = 100

const sanitizeName = (val: string) => val.replace(/\p{Cc}/gu, '').trim()

export const BundleLinkSchema = z.object({
	id: z.string().uuid(),
	name: z
		.string()
		.transform(sanitizeName)
		.pipe(z.string().min(1, 'name cannot be empty').max(64)),
	url: z
		.string()
		.url()
		.refine((val) => /^https?:\/\//i.test(val), 'url must use http or https'),
})

export type BundleLink = z.infer<typeof BundleLinkSchema>

export const SubjectSchema = z.object({
	id: z.number().int(),
	title: z.string().min(1),
	brief: z.string().min(1),
})

const EVENT_TYPE_SET = new Set(eventTypeEnum.enumValues)

export const SubjectEntrySchema = z.object({
	subject: SubjectSchema,
	events: z
		.record(z.string(), BundleLinkSchema.array().min(1))
		.refine((val) => Object.keys(val).length > 0, 'events cannot be empty')
		.refine(
			(val) => Object.keys(val).every((k) => EVENT_TYPE_SET.has(k as never)),
			`event type keys must be one of: ${eventTypeEnum.enumValues.join(', ')}`,
		),
})

/*
 * The sharable bundle payload: a map of subjectId (string key) → subject entry.
 *
 * Invariants enforced:
 *  - At least 1 subject key.
 *  - subject.id must equal the numeric value of the map key.
 *  - Total link count across all subjects ≤ MAX_LINKS_PER_BUNDLE.
 */
export const CreateSharableLinkSchema = z
	.record(
		z.string().regex(/^\d+$/, 'key must be a numeric string'),
		SubjectEntrySchema,
	)
	.refine(
		(val) => Object.keys(val).length > 0,
		'bundle must contain at least one subject',
	)
	.refine(
		(val) =>
			Object.entries(val).every(
				([key, entry]) => entry.subject.id === Number(key),
			),
		'subject.id must match its map key',
	)
	.refine((val) => {
		let total = 0

		for (const entry of Object.values(val)) {
			for (const links of Object.values(entry.events)) {
				total += links.length
			}
		}

		return total <= MAX_LINKS_PER_BUNDLE
	}, `bundle must not exceed ${MAX_LINKS_PER_BUNDLE} total links`)

export type CreateSharableLink = z.infer<typeof CreateSharableLinkSchema>

export const SharableLinkSchema = z.object({
	id: z.string().uuid(),
	links: CreateSharableLinkSchema,
})

export type SharableLink = z.infer<typeof SharableLinkSchema>

export const LinkIdParamSchema = z.object({
	id: z.string().uuid(),
})

export type LinkIdParam = z.infer<typeof LinkIdParamSchema>
