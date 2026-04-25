import type { Routes } from '@/core/types/routes.js'
import {
	getCourseAssignments,
	getCourseGrades,
	getCourses,
	getSiteInfo,
	moodleLogin,
} from '../handlers/index.js'
import { moodleAuthMiddleware } from '../middleware/index.js'
import { GET_COURSE, MOODLE_LOGIN } from '../schemas/index.js'

export const getMoodleRoutes = (): Routes => ({
	routes: [
		{
			method: 'POST',
			url: '/moodle/login',
			handler: moodleLogin,
			schema: {
				tags: ['Moodle'],
				body: MOODLE_LOGIN,
			},
		},
		{
			method: 'GET',
			url: '/moodle/info',
			preHandler: [moodleAuthMiddleware],
			handler: getSiteInfo,
			schema: {
				tags: ['Moodle'],
			},
		},
		{
			method: 'GET',
			url: '/moodle/courses',
			preHandler: [moodleAuthMiddleware],
			handler: getCourses,
			schema: {
				tags: ['Moodle'],
			},
		},
		{
			method: 'GET',
			url: '/moodle/courses/:courseId/grades',
			preHandler: [moodleAuthMiddleware],
			handler: getCourseGrades,
			schema: {
				tags: ['Moodle'],
				params: GET_COURSE,
			},
		},
		{
			method: 'GET',
			url: '/moodle/courses/:courseId/assignments',
			preHandler: [moodleAuthMiddleware],
			handler: getCourseAssignments,
			schema: {
				tags: ['Moodle'],
				params: GET_COURSE,
			},
		},
	],
})
