import fastify from 'fastify'
import userRoutes from './routes/userRoutes'
import { env } from './env/index'

const app = fastify({
  logger: {
    transport: {
      target: 'pino-pretty',
    },
  },
})

app.register(userRoutes, { prefix: '/users' })

app.listen({ port: Number(env.APP_PORT) }).then(() => {
  console.log(`Server is running on port ${env.APP_PORT} 🚀`)
})
