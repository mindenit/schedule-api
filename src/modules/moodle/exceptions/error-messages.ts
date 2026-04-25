import { MOODLE_EXCEPTION_CODE } from './error-codes.js'

const MOODLE_API_EXCEPTION_MESSAGES = {
	dml_missing_record_exception: MOODLE_EXCEPTION_CODE.RECORD_NOT_FOUND_ERROR,
} as const

type MoodleExceptionMessage = keyof typeof MOODLE_API_EXCEPTION_MESSAGES

export { MOODLE_API_EXCEPTION_MESSAGES }
export type { MoodleExceptionMessage }
