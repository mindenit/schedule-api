import type {
	Auditorium,
	AuditoriumType,
	Building,
	Department,
	Direction,
	Event,
	EventType,
	Faculty,
	Group,
	Speciality,
	Subject,
	Teacher,
} from '@/db/types.js'
import type { Maybe } from './common.js'

type RawAuditoriumType = {
	id: string
	short_name: string
}

type RawAuditorium = {
	id: string
	short_name: string
	floor: string
	is_have_power: string
	auditory_types: RawAuditoriumType[]
}

type RawGroup = {
	id: number
	name: string
}

type RawBuilding = {
	id: string
	short_name: string
	full_name: string
	auditories: RawAuditorium[]
}

type RawSpeciality = {
	id: number
	short_name: string
	full_name: string
	groups: RawGroup[]
}

type RawDirection = {
	id: number
	short_name: string
	full_name: string
	specialities: RawSpeciality[]
	groups: RawGroup[]
}

type RawFaculty = {
	id: number
	short_name: string
	full_name: string
}

type WithDirections<T> = T & { directions: RawDirection[] }

type RawTeacher = {
	id: number
	short_name: string
	full_name: string
}

type RawDepartment = {
	id: number
	short_name: string
	full_name: string
	teachers: RawTeacher[]
	departments: RawDepartment[]
}

type WithDepartments<T> = T & { departments: RawDepartment[] }

type RawEvent = {
	subject_id: number
	start_time: number
	end_time: number
	type: number
	number_pair: number
	auditory: string
	teachers: number[]
	groups: number[]
}

type RawEventType = {
	id: number
	short_name: string
	full_name: string
	id_base: string
	type: string
}

type RawSubjectHour = {
	type: number
	val: number
	teachers: number[]
}

type RawSubject = {
	id: number
	brief: string
	title: string
	hours: RawSubjectHour[]
}

type University = {
	short_name: string
	full_name: string
}

type SubjectHour = {
	type: EventType
	hours: number
	teacherId: Maybe<number>
	subjectId: number
}

type CistAuditoriumsRawJson = {
	university: University & { buildings: RawBuilding[] }
}

type CistAuditoriumsOutput = {
	buildings: Building[]
	auditoriums: Auditorium[]
	auditoriumTypes: AuditoriumType[]
}

type CistGroupsOutput = {
	groups: Group[]
	faculties: Faculty[]
	specialities: Speciality[]
	directions: Direction[]
}

type CistTeachersOutput = {
	teachers: Teacher[]
	faculties: Faculty[]
	departments: Department[]
}

type CistScheduleOutput = {
	events: Omit<Event, 'id'>[]
	subjects: Subject[]
	hours: SubjectHour[]
}

type CistGroupsRawJson = {
	university: University & {
		faculties: WithDirections<RawFaculty>[]
	}
}

type CistTeachersRawJson = {
	university: University & {
		faculties: WithDepartments<RawFaculty>[]
	}
}

type CistScheduleRawJson = {
	events: RawEvent[]
	groups: Group[]
	teachers: RawTeacher[]
	subjects: RawSubject[]
	types: RawEventType[]
}

export type {
	CistAuditoriumsOutput,
	CistAuditoriumsRawJson,
	CistGroupsOutput,
	CistGroupsRawJson,
	CistScheduleOutput,
	CistScheduleRawJson,
	CistTeachersOutput,
	CistTeachersRawJson,
	RawAuditorium,
	RawBuilding,
	RawDepartment,
	RawDirection,
	RawSubject,
	RawTeacher,
	SubjectHour,
}
