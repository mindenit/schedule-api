import { AuditoriumSchema } from 'src/core/cist/dtos'
import z from 'zod'

const PublicAuditoriumSchema = AuditoriumSchema.pick({ id: true, name: true })

type PublicAditorium = z.infer<typeof PublicAuditoriumSchema>

export { PublicAuditoriumSchema }
export type { PublicAditorium }
