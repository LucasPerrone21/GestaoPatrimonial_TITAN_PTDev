import fastify from 'fastify'
import fastifyCors from '@fastify/cors'
import userRoutes from './routes/userRoutes'
import demandRoutes from './routes/demandsRoutes'
import adminRoutes from './routes/adminRoutes'
import { env } from './env/index'

const fastifySwagger = require('@fastify/swagger')
const fastifySwaggerUI = require('@fastify/swagger-ui')

const app = fastify({
  logger: {
    transport: {
      target: 'pino-pretty',
    },
  },
})

app.register(fastifyCors, {
  origin: '*', // Permitir todas as origens. Modifique conforme necessário.
  methods: ['GET', 'PUT', 'POST', 'DELETE'], // Métodos permitidos
  allowedHeaders: ['Content-Type', 'Authorization'], // Cabeçalhos permitidos
})

app.register(fastifySwagger, {
  openapi: {
    openapi: '3.0.0',
    info: {
      title: 'API PATRIMONIO',
      description: 'Documentação para nossa API de Patrimonio',
      version: '0.1.0',
    },
    servers: [
      {
        url: `http://localhost:${env.APP_PORT}`,
        description: 'Development server',
      },
    ],
    tags: [
      { name: 'user', description: 'Rotas usuários' },
      { name: 'demands', description: 'Rotas demandas' },
      { name: 'admin', description: 'Rotas admin' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    externalDocs: {
      url: 'https://swagger.io',
      description: 'Find more info here',
    },
  },
  exposeRoute: true,
})

app.register(fastifySwaggerUI, {
  routePrefix: '/documentation',
  uiConfig: {
    docExpansion: 'full',
    deepLinking: false,
  },
  staticCSP: true,
  transformSpecificationClone: true,
})

app.register(userRoutes, { prefix: '/users' })
app.register(demandRoutes, { prefix: '/demands' })
app.register(adminRoutes, { prefix: '/admin' })

app.listen({ port: Number(env.APP_PORT), host: '0.0.0.0' }).then(() => {
  console.log(`Server is running on port ${env.APP_PORT} 🚀`)
}).catch((err) => {
  app.log.error(err)
  process.exit(1)
})
