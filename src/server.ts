import fastify from 'fastify'
import userRoutes from './routes/userRoutes'
import demandRoutes from './routes/demandsRoutes'
import adminRoutes from './routes/adminRoutes'
import { env } from './env/index'

const app = fastify({
  logger: {
    transport: {
      target: 'pino-pretty',
    },
  },
});

app.register(require('@fastify/swagger'), {
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
});

app.register(require('@fastify/swagger-ui'), {
  routePrefix: '/documentation',
  uiConfig: {
    docExpansion: 'full',
    deepLinking: false,
  },
  staticCSP: true,
  transformSpecificationClone: true
});

app.register(userRoutes, { prefix: '/users' });
app.register(demandRoutes, { prefix: '/demands' });
app.register(adminRoutes, { prefix: '/admin' })

app.listen({ port: Number(env.APP_PORT) }).then(() => {
  console.log(`Server is running on port ${env.APP_PORT} 🚀`);
});
