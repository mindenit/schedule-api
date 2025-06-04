import { defineRelations } from 'drizzle-orm'
import * as schema from './schema/index.js'

export const relations = defineRelations(schema, (r) => ({
	academicGroupTable: {
		events: r.many.eventToAcademicGroupTable(),
		speciality: r.one.specialityTable({
			from: r.academicGroupTable.specialityId,
			to: r.specialityTable.id,
			optional: true,
		}),
		direction: r.one.directionTable({
			from: r.academicGroupTable.directionId,
			to: r.directionTable.id,
			optional: true,
		}),
	},
	auditoriumTypeToAuditoriumTable: {
		auditorium: r.one.auditoriumTable({
			from: r.auditoriumTypeToAuditoriumTable.auditoriumId,
			to: r.auditoriumTable.id,
			optional: false,
		}),
		type: r.one.auditoriumTypeTable({
			from: r.auditoriumTypeToAuditoriumTable.auditoriumTypeId,
			to: r.auditoriumTypeTable.id,
			optional: false,
		}),
	},
	auditoriumTypeTable: {
		auditoriums: r.many.auditoriumTypeToAuditoriumTable(),
	},
	auditoriumTable: {
		types: r.many.auditoriumTypeToAuditoriumTable(),
		building: r.one.buildingTable({
			from: r.auditoriumTable.buildingId,
			to: r.buildingTable.id,
			optional: false,
		}),
	},
	buildingTable: {
		auditoriums: r.many.auditoriumTable(),
	},
	departmentTable: {
		faculty: r.one.facultyTable({
			from: r.departmentTable.facultyId,
			to: r.facultyTable.id,
			optional: false,
		}),
		teachers: r.many.teacherTable(),
	},
	directionTable: {
		faculty: r.one.facultyTable({
			from: r.directionTable.facultyId,
			to: r.facultyTable.id,
			optional: false,
		}),
		specialities: r.many.specialityTable(),
		groups: r.many.academicGroupTable(),
	},
	eventToAcademicGroupTable: {
		event: r.one.eventTable({
			from: r.eventToAcademicGroupTable.eventId,
			to: r.eventTable.id,
			optional: false,
		}),
		group: r.one.academicGroupTable({
			from: r.eventToAcademicGroupTable.groudId,
			to: r.academicGroupTable.id,
			optional: false,
		}),
	},
	eventToTeacherTable: {
		event: r.one.eventTable({
			from: r.eventToTeacherTable.eventId,
			to: r.eventTable.id,
			optional: false,
		}),
		teacher: r.one.teacherTable({
			from: r.eventToTeacherTable.teacherId,
			to: r.teacherTable.id,
			optional: false,
		}),
	},
	eventTable: {
		groups: r.many.academicGroupTable(),
		teachers: r.many.teacherTable(),
		auditorium: r.one.auditoriumTable({
			from: r.eventTable.auditoriumId,
			to: r.auditoriumTable.id,
			optional: false,
		}),
		subject: r.one.subjectTable({
			from: r.eventTable.auditoriumId,
			to: r.subjectTable.id,
			optional: false,
		}),
	},
	facultyTable: {
		departments: r.many.departmentTable(),
		directions: r.many.directionTable(),
	},
	specialityTable: {
		groups: r.many.academicGroupTable(),
		direction: r.one.directionTable({
			from: r.specialityTable.directionId,
			to: r.directionTable.id,
			optional: false,
		}),
	},
	subjectToTeacherTable: {
		subject: r.one.subjectTable({
			from: r.subjectToTeacherTable.subjectId,
			to: r.subjectTable.id,
			optional: false,
		}),
		teacher: r.one.teacherTable({
			from: r.subjectToTeacherTable.teacherId,
			to: r.teacherTable.id,
			optional: false,
		}),
	},
	subjectTable: {
		events: r.many.eventTable(),
		teachers: r.many.subjectToTeacherTable(),
	},
	teacherTable: {
		department: r.one.departmentTable({
			from: r.teacherTable.departmentId,
			to: r.departmentTable.id,
			optional: false,
		}),
		events: r.many.eventToTeacherTable(),
		subjects: r.many.subjectToTeacherTable(),
	},
}))
