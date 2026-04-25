import z from 'zod'

const GET_COURSE = z.object({
	courseId: z.coerce.number().int().positive(),
})

type GetCourse = z.infer<typeof GET_COURSE>

const MOODLE_LOGIN = z
	.object({
		username: z.string(),
		password: z.string(),
	})
	.strict()

type MoodleLogin = z.infer<typeof MOODLE_LOGIN>

const MOODLE_LOGIN_RESPONSE = z
	.object({
		token: z.string(),
		privatetoken: z.string().nullable(),
	})
	.strict()

type MoodleLoginResponse = z.infer<typeof MOODLE_LOGIN_RESPONSE>

export { GET_COURSE, MOODLE_LOGIN, MOODLE_LOGIN_RESPONSE }
export type { GetCourse, MoodleLogin, MoodleLoginResponse }
