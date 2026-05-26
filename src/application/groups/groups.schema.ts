import { GroupSchema } from 'src/core/cist/dtos'
import z from 'zod'

const PublicGroupSchema = GroupSchema.pick({ id: true, name: true })

type PublicGroup = z.infer<typeof PublicGroupSchema>

export { PublicGroupSchema }
export type { PublicGroup }
