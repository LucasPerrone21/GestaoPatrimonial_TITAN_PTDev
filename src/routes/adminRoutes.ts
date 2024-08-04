import AdminController from '../controllers/adminController'
import AuthController from '../controllers/authController'
import { FastifyInstance, FastifySchema } from 'fastify'

const adminController = new AdminController()
const authController = new AuthController()

async function adminRoutes(fastify: FastifyInstance) {
  fastify.post(
    '/register',
    {
      schema: {
        tags: ['admin'],
        description: 'Registrar um novo admin',
        body: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            name: { type: 'string' },
            email: { type: 'string' },
            password: { type: 'string' },
          },
        },
        response: {
          201: {
            description: 'Admin registrado com sucesso',
            type: 'object',
            properties: {
              name: { type: 'string' },
              email: { type: 'string' },
            },
          },
        },
      } as FastifySchema,
    },
    adminController.adminRegister,
  )

  fastify.post(
    '/login',
    {
      schema: {
        tags: ['admin'],
        description: 'Logar um admin',
        body: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string' },
            password: { type: 'string' },
          },
        },
        response: {
          200: {
            description: 'Login com sucesso',
            type: 'object',
            properties: {
              token: { type: 'string' },
            },
          },
        },
        security: [
          {
            bearerAuth: [],
          },
        ],
      } as FastifySchema,
    },
    adminController.adminLogin,
  )

  fastify.put(
    '/update',
    {
      schema: {
        tags: ['admin'],
        description: 'Atualizar dados do Admin',
        body: {
          type: 'object',
          properties: {
            email: { type: 'string' },
            name: { type: 'string' },
            password: { type: 'string' },
          },
        },
        response: {
          200: {
            description: 'Dados atualizados com sucesso',
            type: 'object',
            properties: {
              name: { type: 'string' },
              email: { type: 'string' },
            },
          },
        },
        security: [
          {
            bearerAuth: [],
          },
        ],
      } as FastifySchema,
      preValidation: [authController.checkToken],
    },
    adminController.updateAdmin,
  )

  fastify.delete(
    '/delete',
    {
      schema: {
        tags: ['admin'],
        description: 'Deletar um admin',
        response: {
          200: {
            description: 'Admin deletado com sucesso',
            type: 'object',
            properties: {
              success: { type: 'boolean' },
            },
          },
        },
        security: [
          {
            bearerAuth: [],
          },
        ],
      } as FastifySchema,
      preValidation: [authController.checkToken],
    },
    adminController.adminDelete,
  )

  fastify.get(
    '/demands/list',
    {
      schema: {
        tags: ['admin'],
        description: 'List todos admin',
        response: {
          200: {
            description: 'List todas as demandas',
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                title: { type: 'string' },
                description: { type: 'string' },
              },
            },
          },
        },
        security: [
          {
            bearerAuth: [],
          },
        ],
      } as FastifySchema,
      preValidation: [authController.checkToken],
    },
    adminController.adminListDemands,
  )

  fastify.get(
    '/demands/:id',
    {
      schema: {
        tags: ['admin'],
        description: 'Ver demandas específicas ',
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string' },
          },
        },
        response: {
          200: {
            description: 'Detalhes da demanda',
            type: 'object',
            properties: {
              id: { type: 'string' },
              title: { type: 'string' },
              description: { type: 'string' },
            },
          },
        },
        security: [
          {
            bearerAuth: [],
          },
        ],
      } as FastifySchema,
      preValidation: [authController.checkToken],
    },
    adminController.adminViewDemandUser,
  )

  fastify.delete(
    '/demands/:id',
    {
      schema: {
        tags: ['admin'],
        description: 'Deletar demanda específica',
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string' },
          },
        },
        response: {
          200: {
            description: 'Demanda deletada com sucesso',
            type: 'object',
            properties: {
              success: { type: 'boolean' },
            },
          },
        },
        security: [
          {
            bearerAuth: [],
          },
        ],
      } as FastifySchema,
      preValidation: [authController.checkToken],
    },
    adminController.adminDeleteDemand,
  )

  fastify.put(
    '/demands/:id',
    {
      schema: {
        tags: ['admin'],
        description: 'Atualizar demanda específica',
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string' },
          },
        },
        body: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            description: { type: 'string' },
            feedback: { type: 'string' },
            status: { type: 'string' },
          },
        },
        response: {
          200: {
            description: 'Demanda atualizada com sucesso',
            type: 'object',
            properties: {
              success: { type: 'boolean' },
            },
          },
        },
        security: [
          {
            bearerAuth: [],
          },
        ],
      } as FastifySchema,
      preValidation: [authController.checkToken],
    },
    adminController.adminUpdateDemand,
  )
}

export default adminRoutes
