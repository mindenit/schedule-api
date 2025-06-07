import type { academicGroupTable } from './schema/academic-group.js'
import type { auditoriumTable } from './schema/auditorium.js'
import type { buildingTable } from './schema/building.js'
import type { departmentTable } from './schema/department.js'
import type { directionTable } from './schema/direction.js'
import type { eventTypeEnum } from './schema/event-type-enum.js'
import type { facultyTable } from './schema/faculty.js'
import type { specialityTable } from './schema/speciality.js'
import type { subjectTable } from './schema/subject.js'
import type { teacherTable } from './schema/teacher.js'

type Auditorium = Pick<typeof auditoriumTable.$inferSelect, 'id' | 'name'>
type Building = typeof buildingTable.$inferSelect
type Group = typeof academicGroupTable.$inferSelect
type Faculty = typeof facultyTable.$inferSelect
type Department = typeof departmentTable.$inferSelect
type Direction = typeof directionTable.$inferSelect
type Speciality = typeof specialityTable.$inferSelect
type Teacher = typeof teacherTable.$inferSelect
type Subject = typeof subjectTable.$inferSelect

type TeacherData = Omit<Teacher, 'departmentId'>
type GroupData = Omit<Group, 'specialityId' | 'directionId'>

type Event = {
	numberPair: number
	startTime: number
	endTime: number
	type: EventType
	auditorium: string
	subject: Subject
	groups: GroupData[]
	teachers: TeacherData[]
}

type EventType = (typeof eventTypeEnum.enumValues)[number]

export type {
	Auditorium,
	Building,
	Department,
	Direction,
	Event,
	EventType,
	Faculty,
	Group,
	GroupData,
	Speciality,
	Subject,
	Teacher,
	TeacherData,
}
