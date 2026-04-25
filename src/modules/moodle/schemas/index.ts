import z from 'zod'

const GET_COURSE = z.object({
	courseId: z.coerce
		.number()
		.int()
		.positive()
		.describe('Unique Moodle course identifier'),
})

type GetCourse = z.infer<typeof GET_COURSE>

const MOODLE_LOGIN = z
	.object({
		username: z.string().describe('Moodle account username'),
		password: z.string().describe('Moodle account password'),
	})
	.strict()

type MoodleLogin = z.infer<typeof MOODLE_LOGIN>

const MOODLE_LOGIN_RESPONSE = z
	.object({
		token: z.string().describe('Moodle session token'),
		privatetoken: z
			.string()
			.nullable()
			.describe('Moodle private token for web services'),
	})
	.strict()

type MoodleLoginResponse = z.infer<typeof MOODLE_LOGIN_RESPONSE>

const MOODLE_SITE_INFO_RESPONSE = z.object({
	firstName: z.string().describe('User first name'),
	lastName: z.string().describe('User last name'),
	username: z.string().describe('Moodle username'),
	userId: z.number().describe('Unique Moodle user identifier'),
})

const MOODLE_COURSE_RESPONSE = z.object({
	id: z.number().describe('Unique course identifier'),
	name: z.string().describe('Course display name'),
	image: z.string().describe('Course image URL'),
	startedAt: z.number().describe('Course start date as Unix timestamp'),
	endedAt: z.number().describe('Course end date as Unix timestamp'),
	url: z.string().describe('Direct link to the course page'),
})

const MOODLE_GRADE_RANGE = z.object({
	min: z.number().describe('Minimum possible grade'),
	max: z.number().describe('Maximum possible grade'),
})

const MOODLE_FINAL_GRADE = z
	.object({
		grade: z.number().nullable().describe('Final numeric grade value'),
		letterGrade: z.string().nullable().describe('Final letter grade'),
	})
	.nullable()

const MOODLE_GRADE = z.object({
	id: z.number().describe('Grade item identifier'),
	gradedAt: z.number().nullable().describe('Grading date as Unix timestamp'),
	grade: z.number().nullable().describe('Numeric grade value'),
	letterGrade: z.string().nullable().describe('Letter grade representation'),
	range: MOODLE_GRADE_RANGE.describe('Possible grade range'),
	feedback: z.string().nullable().describe('Instructor feedback'),
	name: z.string().optional().describe('Grade item name'),
	module: z
		.string()
		.optional()
		.describe('Source module type (quiz, assignment, etc.)'),
	type: z.string().describe('Grade type (module, course, category)'),
})

const MOODLE_GRADES_RESPONSE = z.object({
	final: MOODLE_FINAL_GRADE.describe('Overall final grade for the course'),
	grades: MOODLE_GRADE.array().describe('List of individual grade items'),
})

const MOODLE_ASSIGNMENT_ATTACHMENT = z.object({
	name: z.string().describe('Attachment file name'),
	size: z.number().describe('File size in bytes'),
	mimeType: z.string().describe('File MIME type'),
	url: z.string().describe('Direct download URL'),
})

const MOODLE_FILE_SUBMISSION = z
	.object({
		maxFiles: z.number().describe('Maximum number of files allowed'),
		maxSize: z.number().describe('Maximum total submission size in bytes'),
		allowedTypes: z
			.string()
			.array()
			.describe('List of allowed file extensions'),
	})
	.nullable()

const MOODLE_ASSIGNMENT_RESPONSE = z.object({
	id: z.number().describe('Unique assignment identifier'),
	name: z.string().describe('Assignment title'),
	deadlineAt: z.number().describe('Submission deadline as Unix timestamp'),
	hardDeadlineAt: z
		.number()
		.describe(
			'Hard cutoff date as Unix timestamp, no submissions accepted after',
		),
	isSubmitRequired: z
		.boolean()
		.describe('Whether submission is required for completion'),
	grade: z.number().describe('Maximum grade for the assignment'),
	reopenMethod: z
		.enum(['manual', 'untilpass', 'none'])
		.describe('Attempt reopen method'),
	intro: z.string().nullable().describe('Assignment description in Markdown'),
	attachments: MOODLE_ASSIGNMENT_ATTACHMENT.array().describe(
		'Assignment attachments provided by the teacher',
	),
	fileSubmission: MOODLE_FILE_SUBMISSION.describe(
		'File submission configuration, null if file upload is disabled',
	),
})

export {
	GET_COURSE,
	MOODLE_LOGIN,
	MOODLE_LOGIN_RESPONSE,
	MOODLE_SITE_INFO_RESPONSE,
	MOODLE_COURSE_RESPONSE,
	MOODLE_GRADES_RESPONSE,
	MOODLE_ASSIGNMENT_RESPONSE,
}
export type { GetCourse, MoodleLogin, MoodleLoginResponse }
