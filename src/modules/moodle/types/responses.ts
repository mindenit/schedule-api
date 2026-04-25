import type { Bit, Maybe } from '@/core/types/common.js'

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

interface MoodleGradesResponse {
	final: Maybe<MoodleFinalGrade>
	grades: MoodleGrade[]
}

type AttemptReopenMethod = 'manual' | 'untilpass' | 'none'

interface RawAssignmentAttachment {
	filename: string
	filesize: number
	mimetype: string
	fileurl: string
}

type MoodleAssigmentInputFormat = 0 | 1 | 2 | 3

type MoodlePlugin = 'file' | 'comment'
interface RawMoodleAssignmentConfig {
	plugin: MoodlePlugin
	subtype: string
	name: string
	value: string
}

interface RawMoodleAssignment {
	id: number
	name: string
	duedate: number
	cutoffdate: number
	grade: number
	gradepenalty: number
	completionsubmit: Bit
	maxattempts: number
	configs: RawMoodleAssignmentConfig[]
	attemptreopenmethod: AttemptReopenMethod
	intro: string
	introformat: MoodleAssigmentInputFormat
	introattachments: RawAssignmentAttachment[]
}

type MoodleWarningItem =
	| 'course'
	| 'module'
	| 'user'
	| 'category'
	| 'section'
	| 'assignment'
	| 'quiz'
	| 'forum'
	| 'group'

type MoodleWarningCode = '1' | '2' | '3' | '4' | '8'

interface MoodleWarning {
	item: MoodleWarningItem
	itemid: number
	warningcode: MoodleWarningCode
	message: string
}

interface MoodleAssignmentsResponse {
	courses: {
		id: number
		fullname: string
		shortname: string
		timemodified: number
		assignments: RawMoodleAssignment[]
	}[]
	warnings: MoodleWarning[]
}

interface MoodleAssignmentAttachment {
	name: string
	size: number
	mimeType: string
	url: string
}

type MoodleAssignmentFileSubmission = {
	maxFiles: number
	maxSize: number
	allowedTypes: string[]
}

interface MoodleAssignment {
	id: number
	name: string
	deadlineAt: number
	hardDeadlineAt: number
	isSubmitRequired: boolean
	grade: number
	reopenMethod: AttemptReopenMethod
	intro: Maybe<string>
	attachments: MoodleAssignmentAttachment[]
	fileSubmission: Maybe<MoodleAssignmentFileSubmission>
}

export type {
	MoodleSiteInfoResponse,
	RawMoodleSiteInfoResponse,
	MoodleCoursesResponse,
	RawMoodleCoursesResponse,
	RawMoodleGradesResponse,
	RawGradeType,
	RawGradeModule,
	RawMoodleAssignment,
	GradeModule,
	GradeType,
	MoodleGrade,
	MoodleGradesResponse,
	RawMoodleGrade,
	MoodleFinalGrade,
	MoodleAssignmentsResponse,
	MoodleWarning,
	MoodleWarningCode,
	MoodleWarningItem,
	MoodleAssignment,
	MoodleAssignmentFileSubmission,
	MoodleAssignmentAttachment,
}
