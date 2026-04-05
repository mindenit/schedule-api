import { getContentType } from '@/core/utils/index.js'
import { Result } from 'better-result'
import { MOODLE_SEARCH_PARAM } from '../constant/index.js'
import { MOODLE_EXCEPTION_CODE } from '../exceptions/error-codes.js'
import { MoodleOperationException } from '../exceptions/moodle.exceptions.js'
import type {
	MoodleInjectableDependencies,
	MoodleRepository,
} from '../types/di.js'
import type { BuildMoodleApiUrlArgs } from '../types/index.js'
import {
	isMoodleErrorResponse,
	isMoodleExceptionResponse,
	throwMoodleApiException,
} from '../utils/index.js'

export class MoodleRepositoryImpl implements MoodleRepository {
	private readonly baseUrl: string
	private static readonly JSON_CONTENT_TYPES: string[] = [
		'application/json',
		'text/json',
	]
	private static readonly JSON_START_CHARS = ['{', '[']

	constructor({ config }: MoodleInjectableDependencies) {
		const { moodle } = config

		this.baseUrl = moodle.baseUrl
	}

	async fetch<T extends object>(
		url: URL,
		params?: RequestInit,
	): Promise<Result<T, MoodleOperationException>> {
		const response = await fetch(url, params)
		const contentType = getContentType(response)

		if (!MoodleRepositoryImpl.JSON_CONTENT_TYPES.includes(contentType)) {
			const text = await response.text()

			if (
				MoodleRepositoryImpl.JSON_START_CHARS.some((char) =>
					text.trim().startsWith(char),
				)
			) {
				const data: T = JSON.parse(text)
				if (isMoodleExceptionResponse(data)) {
					return throwMoodleApiException(data)
				}
				return Result.ok(data)
			}
			return Result.err(
				new MoodleOperationException(
					MOODLE_EXCEPTION_CODE.NON_JSON_API_RESPONSE_ERROR,
					'Received non-JSON response from Moodle API',
				),
			)
		}

		const data = (await response.json()) as T

		if (isMoodleExceptionResponse(data)) {
			return throwMoodleApiException(data)
		}

		if (isMoodleErrorResponse(data)) {
			return throwMoodleApiException(data)
		}

		return Result.ok(data)
	}

	buildApiUrl({
		path = '/webservice/rest/server.php',
		token,
		wsFunction,
		params = {},
	}: BuildMoodleApiUrlArgs): URL {
		const url = new URL(path, this.baseUrl)

		if (token) {
			url.searchParams.set(MOODLE_SEARCH_PARAM.WS_TOKEN, token)
		}

		if (wsFunction) {
			url.searchParams.set(MOODLE_SEARCH_PARAM.WS_FUNCTION, wsFunction)
			url.searchParams.set(MOODLE_SEARCH_PARAM.MOODLE_WS_REST_FORMAT, 'json')
		}

		for (const [key, value] of Object.entries(params)) {
			url.searchParams.set(key, String(value))
		}

		return url
	}
}
