import { DAY } from '@/core/constants/time.js'
import { setCookie } from '@/core/utils/cookie.js'
import { Result } from 'better-result'
import type { FastifyReply } from 'fastify'
import {
	MOODLE_COURSE_PAGE_BASE_URL,
	MOODLE_GRADE_TYPE,
	MOODLE_TOKEN_COOKIE_NAME,
} from '../constant/index.js'
import {
	MOODLE_EXCEPTION_CODE,
	type MoodleExceptionCode,
} from '../exceptions/error-codes.js'
import {
	MOODLE_API_EXCEPTION_MESSAGES,
	type MoodleExceptionMessage,
} from '../exceptions/error-messages.js'
import { MoodleOperationException } from '../exceptions/moodle.exceptions.js'
import type { MoodleException } from '../types/common.js'
import type {
	GradeModule,
	GradeType,
	MoodleAssignment,
	MoodleAssignmentAttachment,
	MoodleAssignmentFileSubmission,
	MoodleCoursesResponse,
	MoodleFinalGrade,
	MoodleGrade,
	MoodleSiteInfoResponse,
	MoodleWarning,
	MoodleWarningCode,
	RawGradeModule,
	RawGradeType,
	RawMoodleAssignment,
	RawMoodleCoursesResponse,
	RawMoodleGrade,
	RawMoodleSiteInfoResponse,
} from '../types/responses.js'
import type { Maybe } from '@/core/types/common.js'
import { HTTP_STATUS, type HttpStatus } from '@/core/constants/http.js'
import { NodeHtmlMarkdown } from 'node-html-markdown'

const getDefaultMoodleHeaders = () => {
	const headers = new Headers()
	headers.set('Content-Type', 'application/x-www-form-urlencoded')
	return headers
}

const isMoodleExceptionResponse = (
	data: unknown,
): data is { exception: string; message: string } => {
	return !!data && typeof data === 'object' && Object.hasOwn(data, 'exception')
}

const isMoodleErrorResponse = (
	data: unknown,
): data is { error: string; message: string } => {
	return (
		!!data &&
		typeof data === 'object' &&
		Object.hasOwn(data, 'error') &&
		!Object.hasOwn(data, 'token')
	)
}

const extractMoodleExceptionMessage = (data: MoodleException): string => {
	if ('exception' in data && data.exception) {
		return data.exception
	}
	if ('error' in data && data.error) {
		return data.error
	}
	return data.message ?? 'Moodle API unknown error'
}

const getMoodleExceptionCode = (
	message: MoodleExceptionMessage | string,
): MoodleExceptionCode => {
	return message in MOODLE_API_EXCEPTION_MESSAGES
		? MOODLE_API_EXCEPTION_MESSAGES[message as MoodleExceptionMessage]
		: MOODLE_EXCEPTION_CODE.API_ERROR
}

const throwMoodleApiException = (data: MoodleException) => {
	const message = extractMoodleExceptionMessage(data)
	const code = getMoodleExceptionCode(message)

	return Result.err(new MoodleOperationException(code, message))
}

const isMoodleAuthTokenValid = (data: unknown): data is { token: string } => {
	return (
		!!data &&
		typeof data === 'object' &&
		Object.hasOwn(data, 'token') &&
		typeof (data as { token: unknown }).token === 'string'
	)
}

const hasPrivateToken = (data: unknown): data is { privatetoken: string } => {
	return (
		!!data &&
		typeof data === 'object' &&
		Object.hasOwn(data, 'privatetoken') &&
		typeof (data as { privatetoken: unknown }).privatetoken === 'string'
	)
}

const setMoodleTokenCookie = (reply: FastifyReply, token: string): void => {
	const expiresAt = new Date(Date.now() + 7 * DAY)

	setCookie({
		name: MOODLE_TOKEN_COOKIE_NAME,
		value: token,
		expiresAt: expiresAt,
	})(reply)
}

const mapMoodleSiteInfo = (
	data: RawMoodleSiteInfoResponse,
): MoodleSiteInfoResponse => ({
	firstName: data.firstname,
	lastName: data.lastname,
	username: data.username,
	userId: data.userid,
})

const ensureCourseIsActive = (data: RawMoodleCoursesResponse): boolean => {
	return data.enddate * 1000 > Date.now()
}

const sanitizeCourseName = (name: string): string => {
	return name.charAt(0).match(/\d/) ? name.slice(1).trim() : name.trim()
}

const removeOptionalCourseSign = (name: string): string => {
	return name.replace('*', '').trim()
}

const mapMoodleCourse = (
	data: RawMoodleCoursesResponse,
): MoodleCoursesResponse => {
	const url = new URL(`${MOODLE_COURSE_PAGE_BASE_URL}/course/view.php`)

	url.searchParams.set('id', data.id.toString())

	return {
		id: data.id,
		name: sanitizeCourseName(data.fullname),
		startedAt: data.startdate,
		endedAt: data.enddate,
		image: data.courseimage,
		url: url.toString(),
	}
}

const byCourseNameAsc = (
	a: MoodleCoursesResponse,
	b: MoodleCoursesResponse,
): number => {
	const nameA = removeOptionalCourseSign(a.name)
	const nameB = removeOptionalCourseSign(b.name)

	return nameA.localeCompare(nameB)
}

const constructMoodleRequestParams = <K extends string, V>(
	params: Record<K, V>,
): Record<Lowercase<K>, V> => {
	return Object.entries(params).reduce(
		(acc, [key, value]) => {
			acc[key.toLowerCase() as Lowercase<K>] = value as V

			return acc
		},
		{} as Record<Lowercase<K>, V>,
	)
}

const mapGradeModule = (module: RawGradeModule): GradeModule => {
	return module === 'assign' ? 'assignment' : module
}

const mapGradeType = (type: RawGradeType): GradeType => {
	return type === 'mod' ? 'module' : type
}

const isAssignmentGrade = (grade: RawMoodleGrade): boolean => {
	return !(
		[MOODLE_GRADE_TYPE.COURSE, MOODLE_GRADE_TYPE.CATEGORY] as string[]
	).includes(grade.itemtype)
}

const mapMoodleCourseGrades = (grade: RawMoodleGrade): MoodleGrade => {
	const baseGrade = {
		id: grade.id,
		gradedAt: grade.gradedategraded,
		grade: grade.graderaw,
		letterGrade: !grade.graderaw ? null : grade.lettergradeformatted,
		range: {
			min: grade.grademin,
			max: grade.grademax,
		},
		feedback: !grade.feedback.trim() ? null : grade.feedback,
	}

	if (grade.itemtype === 'mod') {
		return {
			name: grade.itemname,
			module: mapGradeModule(grade.itemmodule),
			type: 'module' as const,
			...baseGrade,
		}
	}

	return {
		type: mapGradeType(grade.itemtype) as Exclude<GradeType, 'module'>,
		...baseGrade,
	}
}

const getMoodleCourseFinalGrade = (
	grades: RawMoodleGrade[],
): Maybe<MoodleFinalGrade> => {
	const grade = grades.find((g) => g.itemtype === MOODLE_GRADE_TYPE.COURSE)

	if (!grade) {
		return null
	}

	return {
		letterGrade: grade.lettergradeformatted,
		grade: grade.graderaw,
	}
}

const mapMoodleWarningToErrorCode = (
	warning: MoodleWarning,
): MoodleExceptionCode => {
	const warningCodeMap: Record<MoodleWarningCode, MoodleExceptionCode> = {
		'1': MOODLE_EXCEPTION_CODE.RECORD_NOT_FOUND_ERROR,
		'2': MOODLE_EXCEPTION_CODE.ACCESS_DENIED_ERROR,
		'3': MOODLE_EXCEPTION_CODE.INVALID_PARAM_OR_VALUE_ERROR,
		'4': MOODLE_EXCEPTION_CODE.CONTENT_UNAVAILABLE_ERROR,
		'8': MOODLE_EXCEPTION_CODE.ACTIVITY_UNAVAILABLE_ERROR,
	}

	return warningCodeMap[warning.warningcode]
}

const mapMoodleWarningToStatusCode = (warning: MoodleWarning): HttpStatus => {
	const statusCodeMap: Record<MoodleWarningCode, HttpStatus> = {
		'1': HTTP_STATUS.NOT_FOUND,
		'2': HTTP_STATUS.FORBIDDEN,
		'3': HTTP_STATUS.BAD_REQUEST,
		'4': HTTP_STATUS.SERVICE_UNAVAILABLE,
		'8': HTTP_STATUS.SERVICE_UNAVAILABLE,
	}

	return statusCodeMap[warning.warningcode] ?? HTTP_STATUS.INTERNAL_SERVER_ERR
}

const moodleWarningToException = (
	warning: MoodleWarning,
): MoodleOperationException => {
	const code = mapMoodleWarningToErrorCode(warning)
	const status = mapMoodleWarningToStatusCode(warning)

	return new MoodleOperationException(code, warning.message, status)
}

const mapAssignmentFileSubmission = (
	from: RawMoodleAssignment,
): Maybe<MoodleAssignmentFileSubmission> => {
	const fileConfigs = from.configs.filter((c) => c.plugin === 'file')

	const isFileSubmissionEnabled = fileConfigs.find(
		(c) => c.name === 'enabled' && Boolean(c.value),
	)

	if (!isFileSubmissionEnabled) {
		return null
	}

	const allowedFileTypesConfig = fileConfigs.find(
		(c) => c.name === 'filetypeslist',
	)
	const allowedFileTypes = allowedFileTypesConfig
		? allowedFileTypesConfig.value === ''
			? []
			: allowedFileTypesConfig.value.split(',')
		: []

	return {
		maxFiles: Number(
			fileConfigs.find((c) => c.name === 'maxfilesubmissions')?.value,
		),
		maxSize: Number(
			fileConfigs.find((c) => c.name === 'maxsubmissionsizebytes')?.value,
		),
		allowedTypes: allowedFileTypes,
	}
}

const mapAssignmentAttachments = (
	from: RawMoodleAssignment,
): MoodleAssignmentAttachment[] => {
	return from.introattachments.map((attachment) => ({
		name: attachment.filename,
		url: attachment.fileurl,
		size: attachment.filesize,
		mimeType: attachment.mimetype,
	}))
}

const mapAssignmentIntro = (from: RawMoodleAssignment): string => {
	if (from.introformat === 1) {
		return NodeHtmlMarkdown.translate(from.intro)
	}

	return from.intro
}

const mapMoodleAssignment = (from: RawMoodleAssignment): MoodleAssignment => ({
	id: from.id,
	name: from.name,
	deadlineAt: from.duedate,
	hardDeadlineAt: from.cutoffdate,
	isSubmitRequired: Boolean(from.completionsubmit),
	grade: from.grade,
	reopenMethod: from.attemptreopenmethod,
	intro: from.intro.trim() ? mapAssignmentIntro(from) : null,
	fileSubmission: mapAssignmentFileSubmission(from),
	attachments: mapAssignmentAttachments(from),
})

export {
	byCourseNameAsc,
	constructMoodleRequestParams,
	ensureCourseIsActive,
	getDefaultMoodleHeaders,
	hasPrivateToken,
	isAssignmentGrade,
	isMoodleAuthTokenValid,
	isMoodleErrorResponse,
	isMoodleExceptionResponse,
	mapMoodleCourse,
	mapMoodleCourseGrades,
	mapMoodleSiteInfo,
	setMoodleTokenCookie,
	throwMoodleApiException,
	getMoodleCourseFinalGrade,
	moodleWarningToException,
	mapMoodleAssignment,
}
