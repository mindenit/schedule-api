import type { Maybe } from '@/core/types/common.js'

interface MoodleFunction {
	name: string
	version: string
}

interface RawMoodleSiteInfoResponse {
	sitename: string
	username: string
	firstname: string
	lastname: string
	lang: string
	userid: number
	siteurl: string
	userpictureurl: number
	functions: MoodleFunction[]
}

interface MoodleSiteInfoResponse {
	firstName: string
	lastName: string
	username: string
	userId: number
}

interface RawMoodleCoursesResponse {
	id: number
	shortname: string
	fullname: string
	displayname: string
	courseimage: string
	startdate: number
	enddate: number
}

interface MoodleCoursesResponse {
	id: number
	name: string
	image: string
	startedAt: number
	endedAt: number
	url: string
}

type RawGradeModule = 'quiz' | 'assign' | 'course' | 'attendance'
type RawGradeType = 'mod' | 'course' | 'category'

interface BaseRawMoodleGrade {
	id: number
	graderaw: number
	grademin: number
	grademax: number
	gradedategraded: Maybe<number>
	lettergradeformatted: Maybe<string>
	feedback: string
}

type RawMoodleGrade = BaseRawMoodleGrade &
	(
		| {
				itemname: string
				itemtype: Extract<RawGradeType, 'mod'>
				itemmodule: RawGradeModule
		  }
		| {
				itemtype: Exclude<RawGradeType, 'mod'>
		  }
	)

interface RawMoodleGradesResponse {
	usergrades: {
		courseid: number
		gradeitems: RawMoodleGrade[]
	}[]
}

type GradeModule = Exclude<RawGradeModule, 'assign'> | 'assignment'
type GradeType = Exclude<RawGradeType, 'mod'> | 'module'

type GradeRange = {
	min: number
	max: number
}

interface BaseMoodleGrade {
	id: number
	gradedAt: Maybe<number>
	grade: Maybe<number>
	letterGrade: Maybe<string>
	range: GradeRange
	feedback: Maybe<string>
}

type MoodleGrade = BaseMoodleGrade &
	(
		| { name: string; module: GradeModule; type: Extract<GradeType, 'module'> }
		| { type: Exclude<GradeType, 'module'> }
	)

type MoodleFinalGrade = Pick<BaseMoodleGrade, 'grade' | 'letterGrade'>

type MoodleGradesResponse = {
	final: Maybe<MoodleFinalGrade>
	grades: MoodleGrade[]
}

export type {
	MoodleSiteInfoResponse,
	RawMoodleSiteInfoResponse,
	MoodleCoursesResponse,
	RawMoodleCoursesResponse,
	RawMoodleGradesResponse,
	RawGradeType,
	RawGradeModule,
	GradeModule,
	GradeType,
	MoodleGrade,
	MoodleGradesResponse,
	RawMoodleGrade,
	MoodleFinalGrade,
}
