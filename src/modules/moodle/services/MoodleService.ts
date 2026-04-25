import { HTTP_STATUS } from '@/core/constants/http.js'
import type { HttpExceptionMap } from '@/core/types/common.js'
import { mapHttpException } from '@/core/utils/common.js'
import { Result } from 'better-result'
import { MOODLE_SEARCH_PARAM, MOODLE_WS_FUNCTION } from '../constant/index.js'
import {
	MOODLE_EXCEPTION_CODE,
	type MoodleExceptionCode,
} from '../exceptions/error-codes.js'
import { MoodleOperationException } from '../exceptions/moodle.exceptions.js'
import type { MoodleLogin, MoodleLoginResponse } from '../schemas/index.js'
import type {
	GetAssignmentsArgs,
	GetCourseContent,
	GetCourseGradesArgs,
	GetUserCoursesArgs,
	MoodleInjectableDependencies,
	MoodleRepository,
	MoodleService,
} from '../types/index.js'
import type {
	MoodleAssignmentsResponse,
	MoodleGradesResponse,
	MoodleSiteInfoResponse,
	RawMoodleCoursesResponse,
	RawMoodleGradesResponse,
	RawMoodleSiteInfoResponse,
} from '../types/responses.js'
import {
	byCourseNameAsc,
	constructMoodleRequestParams,
	getDefaultMoodleHeaders,
	getMoodleCourseFinalGrade,
	hasPrivateToken,
	isAssignmentGrade,
	isMoodleAuthTokenValid,
	mapMoodleAssignment,
	mapMoodleCourse,
	mapMoodleCourseGrades,
	mapMoodleSiteInfo,
	moodleWarningToException,
} from '../utils/index.js'

export class MoodleServiceImpl implements MoodleService {
	private readonly repository: MoodleRepository

	constructor({ moodleRepository }: MoodleInjectableDependencies) {
		this.repository = moodleRepository
	}

	async login(
		data: MoodleLogin,
	): Promise<Result<MoodleLoginResponse, MoodleOperationException>> {
		const url = this.repository.buildApiUrl({ path: '/login/token.php' })

		const body = new URLSearchParams()
		body.set(MOODLE_SEARCH_PARAM.SERVICE, 'moodle_mobile_app')
		for (const [key, value] of Object.entries(data)) {
			body.set(key, value)
		}

		const result = await this.repository.fetch<Record<string, unknown>>(url, {
			method: 'POST',
			headers: getDefaultMoodleHeaders(),
			body,
		})

		if (result.isErr()) {
			return Result.err(
				new MoodleOperationException(
					MOODLE_EXCEPTION_CODE.LOGIN_FAILED_ERROR,
					result.error.message,
				),
			)
		}

		const response = result.unwrap()

		if (!isMoodleAuthTokenValid(response)) {
			return Result.err(
				new MoodleOperationException(
					MOODLE_EXCEPTION_CODE.INVALID_TOKEN_ERROR,
					'Invalid login response from Moodle',
				),
			)
		}

		return Result.ok({
			token: response.token,
			privatetoken: hasPrivateToken(response) ? response.privatetoken : null,
		})
	}

	async getSiteInfo(
		token: string,
	): Promise<Result<MoodleSiteInfoResponse, MoodleOperationException>> {
		const url = this.repository.buildApiUrl({
			token,
			wsFunction: MOODLE_WS_FUNCTION.GET_SITE_INFO,
		})

		const result = await this.repository.fetch<RawMoodleSiteInfoResponse>(url)

		return result.map(mapMoodleSiteInfo)
	}

	async getUserCourses({ token, ...rest }: GetUserCoursesArgs) {
		const params = constructMoodleRequestParams(rest)

		const url = this.repository.buildApiUrl({
			token,
			wsFunction: MOODLE_WS_FUNCTION.GET_COURSES,
			params,
		})

		const result = await this.repository.fetch<RawMoodleCoursesResponse[]>(url)

		if (result.isErr()) {
			const errorMap: HttpExceptionMap<MoodleExceptionCode> = {
				[MOODLE_EXCEPTION_CODE.RECORD_NOT_FOUND_ERROR]: {
					message: 'No courses found for the specified user.',
					status: HTTP_STATUS.NOT_FOUND,
				},
			}

			const obj = mapHttpException(result.error.code, errorMap)

			return Result.err(
				new MoodleOperationException(
					result.error.code,
					obj.message ?? result.error.message,
					obj.status,
				),
			)
		}

		const courses = result
			.unwrap()
			.map(mapMoodleCourse)
			.toSorted(byCourseNameAsc)

		return Result.ok(courses)
	}

	async getCourseGrades({
		token,
		...rest
	}: GetCourseGradesArgs): Promise<
		Result<MoodleGradesResponse, MoodleOperationException>
	> {
		const params = constructMoodleRequestParams(rest)
		const url = this.repository.buildApiUrl({
			token,
			wsFunction: MOODLE_WS_FUNCTION.GET_COURSE_GRADES,
			params,
		})

		const result = await this.repository.fetch<RawMoodleGradesResponse>(url)

		if (result.isErr()) {
			const errorMap: HttpExceptionMap<MoodleExceptionCode> = {
				[MOODLE_EXCEPTION_CODE.RECORD_NOT_FOUND_ERROR]: {
					message: 'No grade record found for the specified course and user.',
					status: HTTP_STATUS.NOT_FOUND,
				},
			}

			const obj = mapHttpException(result.error.code, errorMap)

			return Result.err(
				new MoodleOperationException(
					result.error.code,
					obj.message ?? result.error.message,
					obj.status,
				),
			)
		}

		const gradesObj = result.unwrap().usergrades.at(0)

		if (!gradesObj) {
			return Result.ok({ final: null, grades: [] })
		}

		const grades = gradesObj.gradeitems
		const moduleGrades = grades
			.filter(isAssignmentGrade)
			.map(mapMoodleCourseGrades)

		return Result.ok({
			final: getMoodleCourseFinalGrade(grades),
			grades: moduleGrades,
		})
	}

	async getCourseAssignments({
		token,
		courseId,
	}: GetAssignmentsArgs): Promise<Result<unknown, MoodleOperationException>> {
		const url = this.repository.buildApiUrl({
			token: token,
			wsFunction: MOODLE_WS_FUNCTION.GET_ASSIGNMENTS,
		})

		url.searchParams.set(`courseids[]`, courseId.toString())

		const response = await this.repository.fetch<MoodleAssignmentsResponse>(url)

		if (response.isErr()) {
			return Result.err(response.error)
		}

		const courses = response.unwrap().courses

		if (!courses.length) {
			const warning = response.unwrap().warnings.at(0)

			if (!warning) {
				return Result.err(
					new MoodleOperationException(
						MOODLE_EXCEPTION_CODE.API_ERROR,
						'Failed to fetch course assignments due to an unknown error.',
						HTTP_STATUS.INTERNAL_SERVER_ERR,
					),
				)
			}

			return Result.err(moodleWarningToException(warning))
		}

		const assignments = courses.at(0)?.assignments

		if (!assignments) {
			return Result.ok([])
		}

		return Result.ok(assignments.map(mapMoodleAssignment))
	}

	async getCourseContent({
		token,
		...rest
	}: GetCourseContent): Promise<Result<unknown, MoodleOperationException>> {
		const params = constructMoodleRequestParams(rest)

		const url = this.repository.buildApiUrl({
			token,
			wsFunction: MOODLE_WS_FUNCTION.GET_COURSE_CONTENT,
			params,
		})

		return this.repository.fetch(url)
	}
}
