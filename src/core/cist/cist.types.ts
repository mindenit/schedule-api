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

type AuditoriumParserOutput = {
	buildings: Building[]
	auditoriums: Auditorium[]
	auditoriumTypes: AuditoriumType[]
}

type GroupsParserOutput = {
	groups: Group[]
	faculties: Faculty[]
	specialities: Speciality[]
	directions: Direction[]
}

type TeachersParserOutput = {
	teachers: Teacher[]
	faculties: Faculty[]
	departments: Department[]
}

type PairsParserOutput = {
	events: Event[]
	subjects: Subject[]
	hours: SubjectHour[]
}

export type {
	AuditoriumParserOutput,
	GroupsParserOutput,
	TeachersParserOutput,
	PairsParserOutput,
}
