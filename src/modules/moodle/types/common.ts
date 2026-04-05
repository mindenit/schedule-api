type MoodleException =
	| { exception: string; message: string }
	| { error: string; message: string }

type MoodleApiParams = Record<string, string | number>

interface BaseMoodleArgs {
	token: string
}

interface BuildMoodleApiUrlArgs {
	path?: string
	token?: string
	wsFunction?: string
	params?: MoodleApiParams
}

interface GetAssignmentsArgs extends BaseMoodleArgs {
	courseId: number
}

interface GetUserCoursesArgs extends BaseMoodleArgs {
	userId: number
}

interface GetCourseGradesArgs extends BaseMoodleArgs {
	courseId: number
	userId: number
}

interface GetCourseContent extends BaseMoodleArgs {
	courseId: number
}

export type {
	MoodleException,
	BaseMoodleArgs,
	BuildMoodleApiUrlArgs,
	GetAssignmentsArgs,
	GetCourseContent,
	GetUserCoursesArgs,
	GetCourseGradesArgs,
}
