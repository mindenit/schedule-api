import type { BaseDiConfig, InjectableDependencies } from '@/core/types/deps.js'
import type { Result } from 'better-result'
import type { MoodleOperationException } from '../exceptions/moodle.exceptions.js'
import type { MoodleLogin, MoodleLoginResponse } from '../schemas/index.js'
import type {
	BuildMoodleApiUrlArgs,
	GetAssignmentsArgs,
	GetCourseContent,
	GetCourseGradesArgs,
	GetUserCoursesArgs,
} from './common.js'
import type {
	MoodleGradesResponse,
	MoodleSiteInfoResponse,
} from './responses.js'

interface MoodleRepository {
	buildApiUrl: (args: BuildMoodleApiUrlArgs) => URL
	fetch: <T extends object>(
		url: URL,
		params?: RequestInit,
	) => Promise<Result<T, MoodleOperationException>>
}

interface MoodleService {
	getSiteInfo: (
		token: string,
	) => Promise<Result<MoodleSiteInfoResponse, MoodleOperationException>>
	getUserCourses: (
		args: GetUserCoursesArgs,
	) => Promise<Result<unknown, MoodleOperationException>>
	getCourseGrades: (
		args: GetCourseGradesArgs,
	) => Promise<Result<MoodleGradesResponse, MoodleOperationException>>
	getCourseAssignments: (
		args: GetAssignmentsArgs,
	) => Promise<Result<unknown, MoodleOperationException>>
	login: (
		data: MoodleLogin,
	) => Promise<Result<MoodleLoginResponse, MoodleOperationException>>
	getCourseContent: (
		data: GetCourseContent,
	) => Promise<Result<unknown, MoodleOperationException>>
}

interface MoodleModuleDependencies {
	moodleService: MoodleService
	moodleRepository: MoodleRepository
}

type MoodleInjectableDependencies =
	InjectableDependencies<MoodleModuleDependencies>

type MoodleDiConfig = BaseDiConfig<MoodleModuleDependencies>

export type {
	MoodleDiConfig,
	MoodleInjectableDependencies,
	MoodleModuleDependencies,
	MoodleService,
	MoodleRepository,
}
