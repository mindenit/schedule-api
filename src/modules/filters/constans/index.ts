const FILTER_TYPES = ['lesson_type', 'teacher', 'group', 'subject'] as const

type FILTER_TYPE = (typeof FILTER_TYPES)[number]

export { FILTER_TYPES }
export type { FILTER_TYPE }
