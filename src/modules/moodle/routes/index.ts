import type { Routes } from '@/core/types/routes.js'
import {
	generateFailureResponseSchema,
	generateSuccessResponseSchema,
} from '@/core/utils/schemas.js'
import {
	getCourseAssignments,
	getCourseGrades,
	getCourses,
	getSiteInfo,
	moodleLogin,
} from '../handlers/index.js'
import { moodleAuthMiddleware } from '../middleware/index.js'
import {
	GET_COURSE,
	MOODLE_LOGIN,
	MOODLE_LOGIN_RESPONSE,
	MOODLE_SITE_INFO_RESPONSE,
	MOODLE_COURSE_RESPONSE,
	MOODLE_GRADES_RESPONSE,
	MOODLE_ASSIGNMENT_RESPONSE,
} from '../schemas/index.js'

export const getMoodleRoutes = (): Routes => ({
	routes: [
		{
			method: 'POST',
			url: '/moodle/login',
			handler: moodleLogin,
			schema: {
				tags: ['Moodle'],
				summary: 'Login to Moodle',
				description:
					'Authenticate with Moodle credentials and receive a session token',
				body: MOODLE_LOGIN,
				response: {
					200: generateSuccessResponseSchema(MOODLE_LOGIN_RESPONSE).describe(
						'Successfully authenticated',
					),
					500: generateFailureResponseSchema(500).describe(
						'Login failed or invalid credentials',
					),
				},
			},
		},
		{
			method: 'GET',
			url: '/moodle/info',
			preHandler: [moodleAuthMiddleware],
			handler: getSiteInfo,
			schema: {
				tags: ['Moodle'],
				summary: 'Get site info',
				description:
					'Retrieve Moodle site information and current user profile',
				security: [{ CookieAuth: [] }],
				response: {
					200: generateSuccessResponseSchema(
						MOODLE_SITE_INFO_RESPONSE,
					).describe('Site info and user profile'),
					401: generateFailureResponseSchema(401).describe(
						'Moodle authentication token is missing or invalid',
					),
					500: generateFailureResponseSchema(500).describe(
						'Failed to fetch site info from Moodle',
					),
				},
			},
		},
		{
			method: 'GET',
			url: '/moodle/courses',
			preHandler: [moodleAuthMiddleware],
			handler: getCourses,
			schema: {
				tags: ['Moodle'],
				summary: 'Get user courses',
				description:
					'Retrieve all active courses enrolled by the authenticated user',
				security: [{ CookieAuth: [] }],
				response: {
					200: generateSuccessResponseSchema(
						MOODLE_COURSE_RESPONSE.array(),
					).describe('List of enrolled courses'),
					401: generateFailureResponseSchema(401).describe(
						'Moodle authentication token is missing or invalid',
					),
					404: generateFailureResponseSchema(404).describe(
						'No courses found for the user',
					),
					500: generateFailureResponseSchema(500).describe(
						'Failed to fetch courses from Moodle',
					),
				},
			},
		},
		{
			method: 'GET',
			url: '/moodle/courses/:courseId/grades',
			preHandler: [moodleAuthMiddleware],
			handler: getCourseGrades,
			schema: {
				tags: ['Moodle'],
				summary: 'Get course grades',
				description:
					'Retrieve grade items and final grade for a specific course',
				security: [{ CookieAuth: [] }],
				params: GET_COURSE,
				response: {
					200: generateSuccessResponseSchema(MOODLE_GRADES_RESPONSE).describe(
						'Grade items and final grade for the course',
					),
					401: generateFailureResponseSchema(401).describe(
						'Moodle authentication token is missing or invalid',
					),
					404: generateFailureResponseSchema(404).describe(
						'No grade record found for the course and user',
					),
					500: generateFailureResponseSchema(500).describe(
						'Failed to fetch grades from Moodle',
					),
				},
			},
		},
		{
			method: 'GET',
			url: '/moodle/courses/:courseId/assignments',
			preHandler: [moodleAuthMiddleware],
			handler: getCourseAssignments,
			schema: {
				tags: ['Moodle'],
				summary: 'Get course assignments',
				description: 'Retrieve all assignments for a specific course',
				security: [{ CookieAuth: [] }],
				params: GET_COURSE,
				response: {
					200: generateSuccessResponseSchema(
						MOODLE_ASSIGNMENT_RESPONSE.array(),
					).describe('List of assignments for the course'),
					401: generateFailureResponseSchema(401).describe(
						'Moodle authentication token is missing or invalid',
					),
					403: generateFailureResponseSchema(403).describe(
						'Access denied to the course assignments',
					),
					404: generateFailureResponseSchema(404).describe('Course not found'),
					500: generateFailureResponseSchema(500).describe(
						'Failed to fetch assignments from Moodle',
					),
					503: generateFailureResponseSchema(503).describe(
						'Course content or activity is currently unavailable',
					),
				},
			},
		},
	],
})
