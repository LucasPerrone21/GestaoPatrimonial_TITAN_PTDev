import 'dotenv/config'
import { z } from 'zod'

console.log(typeof process.env.APP_PORT)

const envSchema = z.object({
  DATABASE_URL: z.string(),
  APP_PORT: z.string().default('8000'),
})

export const env = envSchema.parse(process.env)
