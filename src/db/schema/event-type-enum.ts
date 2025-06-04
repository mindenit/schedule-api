import { pgEnum } from 'drizzle-orm/pg-core'

export const eventTypeEnum = pgEnum('event_type', [
	'Лк',
	'Пз',
	'Лб',
	'Конс',
	'Зал',
	'Екз',
	'КП/КР',
])
