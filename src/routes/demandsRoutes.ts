// demandRoutes.ts
import DemandController from '../controllers/demandsController'
import AuthController from '../controllers/authController'
import { FastifyInstance, FastifySchema } from 'fastify'

const demandController = new DemandController()
const authController = new AuthController()

async function demandRoutes(fastify: FastifyInstance) {
  fastify.post('/create', {
    schema: {
      tags: ['demands'],
      description: 'Crie uma nova demanda',
      body: {
        type: 'object',
        required: ['title', 'description'],
        properties: {
          title: { type: 'string' },
          description: { type: 'string' }
        }
      },
      response: {
        201: {
          description: 'Demanda criada com sucesso',
          type: 'object',
          properties: {
            title: { type: 'string' },
            description: { type: 'string' }
          }
        }
      },
      security: [
        {
          bearerAuth: []
        }
      ] 
    } as FastifySchema,
    preValidation: [authController.checkToken]
  }, demandController.createNewDemand)

  fastify.get('/list', {
    schema: {
      tags: ['demands'],  
      description: 'Listar todas as demandas',
      response: {
        200: {
          description: 'Lista de demandas',
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              title: { type: 'string' },
              description: { type: 'string' }
            }
          }
        }
      },
      security: [
        {
          bearerAuth: []
        }
      ] 
    } as FastifySchema,
    preValidation: [authController.checkToken]
  }, demandController.demandsList)

  fastify.delete('/delete/:id', {
    schema: {
      tags: ['demands'],  
      description: 'Delete uma demanda',
      params: {
        type: 'object',
        properties: {
          id: { type: 'number' }  
        },
        required: ['id']
      },
      response: { 
        200: {
          description: 'Demanda apagada com sucesso',
          type: 'object',
          properties: {
            success: { type: 'boolean' }
          }
        }
      },
      security: [
        {
          bearerAuth: []
        }
      ] 
    } as FastifySchema,
    preValidation: [authController.checkToken]
  }, demandController.demandsDelete)

  fastify.post('/update', {
    schema: {
      tags: ['demands'],  
      description: 'Atualize uma demanada',
      body: {
        type: 'object',
        required: ['id', 'title', 'description'],
        properties: {
          id: { type: 'number' },
          title: { type: 'string' },
          description: { type: 'string' }
        }
      },
      response: {
        200: {
          description: 'Demanda atualizada com sucesso',
          type: 'object',
          properties: {
            id: { type: 'number' },
            title: { type: 'string' }
          }
        }
      },
      security: [
        {
          bearerAuth: []
        }
      ] 
    } as FastifySchema,
    preValidation: [authController.checkToken]
  }, demandController.demandsUpdate)
}

export default demandRoutes
 