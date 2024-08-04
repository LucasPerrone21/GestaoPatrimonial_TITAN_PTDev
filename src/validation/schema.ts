import { z } from 'zod'

const userSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
})

const demandSchema = z.object({
  title: z.string().min(2),
  description: z.string().min(2),
  status: z.string().min(2),
})

export { userSchema, demandSchema }
