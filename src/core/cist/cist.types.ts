import {
	Auditorium,
	AuditoriumType,
	Building,
	Department,
	Direction,
	Event,
	Faculty,
	Group,
	Speciality,
	Subject,
	SubjectHour,
	Teacher,
} from './dtos'

interface AuditoriumParserOutput {
	buildings: Building[]
	auditoriums: Auditorium[]
	auditoriumTypes: AuditoriumType[]
}

interface GroupsParserOutput {
	groups: Group[]
	faculties: Faculty[]
	specialities: Speciality[]
	directions: Direction[]
}

interface TeachersParserOutput {
	teachers: Teacher[]
	faculties: Faculty[]
	departments: Department[]
}

interface PairsParserOutput {
	events: Event[]
	subjects: Subject[]
	hours: SubjectHour[]
}

export type {
	AuditoriumParserOutput,
	GroupsParserOutput,
	PairsParserOutput,
	TeachersParserOutput,
}
