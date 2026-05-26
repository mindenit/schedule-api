import { TeacherSchema } from 'src/core/cist/dtos'
import z from 'zod'

const PublicTeacherSchema = TeacherSchema.omit({ departmentId: true })

type PublicTeacher = z.infer<typeof PublicTeacherSchema>

export { PublicTeacherSchema }
export type { PublicTeacher }
