export class RedisKeyBuilder {
	static auditoriumKey(auditoriumId: number): string {
		return `auditoriums:${auditoriumId}`
	}

	static auditoriumTypeKey(typeId: number): string {
		return `auditorium-types:${typeId}`
	}

	static buildingKey(buildingId: string): string {
		return `buildings:${buildingId}`
	}

	static departmentKey(departmentId: number): string {
		return `departments:${departmentId}`
	}

	static directionKey(directionId: number): string {
		return `directions:${directionId}`
	}

	static facultyKey(facultyId: number): string {
		return `faculties:${facultyId}`
	}

	static groupKey(groupId: number): string {
		return `groups:${groupId}`
	}

	static teacherKey(teacherId: number): string {
		return `teachers:${teacherId}`
	}

	static specialityKey(specialityId: number): string {
		return `specialities:${specialityId}`
	}

	static subjectKey(subjectId: number): string {
		return `subjects:${subjectId}`
	}

	static eventKey(event: {
		subject: { id: number }
		startedAt: number
		endedAt: number
	}): string {
		return `events:${event.subject.id}:${event.startedAt}:${event.endedAt}`
	}

	static teacherEventKey(teacherId: number, eventId: number): string {
		return `teachers:${teacherId}:events:${eventId}`
	}

	static groupEventKey(groupId: number, eventId: number): string {
		return `groups:${groupId}:events:${eventId}`
	}

	static newEventsSetKey(): string {
		return 'new-events'
	}

	static oldEventsSetKey(): string {
		return 'old-events'
	}
}
