import { EventType } from '../dtos'

export const cistTypeIdToEventType = (id: number): EventType => {
	if (id === 10 || id === 12) return 'Пз'
	if (id >= 20 && id <= 24) return 'Лб'
	if (id === 30) return 'Конс'
	if (id >= 40 && id <= 41) return 'Зал'
	if (id >= 50 && id <= 55) return 'Екз'
	if (id === 60) return 'КП/КР'
	return 'Лк'
}
