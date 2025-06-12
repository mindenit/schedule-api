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

	static eventKey(hash: string): string {
		return `events:${hash}`
	}

	static facultyKey(facultyId: number): string {
		return `faculties:${facultyId}`
	}

	static groupKey(groupId: number): string {
		return `groups:${groupId}`
	}

	static groupEventKey(groupId: number, eventId: number): string {
		return `group-event:${groupId}:${eventId}`
	}

	static teacherKey(teacherId: number): string {
		return `teachers:${teacherId}`
	}

	static teacherEventKey(teacherId: number, eventId: number): string {
		return `teacher-events:${teacherId}:${eventId}`
	}

	static teacherSubjectKey(teacherId: number, subjectId: number): string {
		return `teacher-subjects:${teacherId}:${subjectId}`
	}

	static specialityKey(specialityId: number): string {
		return `specialities:${specialityId}`
	}

	static subjectKey(subjectId: number): string {
		return `subjects:${subjectId}`
	}
}
