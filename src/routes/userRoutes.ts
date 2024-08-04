import UserController from '../controllers/userController'
import AuthController from '../controllers/authController'
import { FastifyInstance, FastifySchema } from 'fastify'

const userController = new UserController()
const authController = new AuthController()

async function userRoutes(fastify: FastifyInstance) {
  fastify.post(
    '/register',
    {
      schema: {
        tags: ['user'],
        description: 'Registre um novo usuário',
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
          200: {
            description: 'Usuário registrado com sucesso',
            type: 'object',
            properties: {
              name: { type: 'string' },
              email: { type: 'string' },
              password: { type: 'string' },
            },
          },
        },
      } as FastifySchema,
    },
    userController.register,
  )

  fastify.post(
    '/login',
    {
      schema: {
        tags: ['user'],
        description: 'Faça o login de um usuário existente',
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
            description: 'Logado com sucesso',
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
    userController.login,
  )

  fastify.put(
    '/update',
    {
      schema: {
        tags: ['user'],
        description: 'Atualize os dados de um usuário',
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
            description: 'Dado atualizado com sucesso',
            type: 'object',
            properties: {
              email: { type: 'string' },
              name: { type: 'string' },
              password: { type: 'string' },
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
    userController.update,
  )

  fastify.delete(
    '/delete',
    {
      schema: {
        tags: ['user'],
        description: 'Delete um usuário',
        response: {
          200: {
            description: 'Usuário apagada com sucesso',
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
    userController.deleteUser,
  )
}

export default userRoutes
