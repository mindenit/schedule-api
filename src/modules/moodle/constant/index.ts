import { env } from '@/env.js'

const MOODLE_TOKEN_COOKIE_NAME = 'moodleToken' as const

const MOODLE_SEARCH_PARAM = {
	WS_TOKEN: 'wstoken',
	WS_FUNCTION: 'wsfunction',
	MOODLE_WS_REST_FORMAT: 'moodlewsrestformat',
	SERVICE: 'service',
} as const

const MOODLE_WS_FUNCTION = {
	GET_SITE_INFO: 'core_webservice_get_site_info',
	GET_ASSIGNMENTS: 'mod_assign_get_assignments',
	GET_COURSES: 'core_enrol_get_users_courses',
	GET_COURSE_GRADES: 'gradereport_user_get_grade_items',
} as const

const MOODLE_COURSE_PAGE_BASE_URL = `${env.MOODLE_BASE_URL}/course/view.php`

const MOODLE_GRADE_TYPE = {
	COURSE: 'course',
	MODULE: 'module',
	CATEGORY: 'category',
} as const

export {
	MOODLE_SEARCH_PARAM,
	MOODLE_WS_FUNCTION,
	MOODLE_TOKEN_COOKIE_NAME,
	MOODLE_COURSE_PAGE_BASE_URL,
	MOODLE_GRADE_TYPE,
}
