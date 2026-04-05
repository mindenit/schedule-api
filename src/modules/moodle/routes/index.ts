import type { Routes } from '@/core/types/routes.js'
import {
	getCourseGrades,
	getCourses,
	getSiteInfo,
	moodleLogin,
} from '../handlers/index.js'
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
			handler: getSiteInfo,
			schema: {
				tags: ['Moodle'],
			},
		},
		{
			method: 'GET',
			url: '/moodle/courses',
			handler: getCourses,
			schema: {
				tags: ['Moodle'],
			},
		},
		{
			method: 'GET',
			url: '/moodle/courses/:courseId/grades',
			handler: getCourseGrades,
			schema: {
				tags: ['Moodle'],
				params: GET_COURSE,
			},
		},
	],
})
