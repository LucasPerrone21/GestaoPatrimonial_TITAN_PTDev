import UserController from '../controllers/userController'
import { FastifyInstance } from 'fastify'

const userController = new UserController()

async function userRoutes(fastify: FastifyInstance) {
  fastify.post('/create', userController.create)
}

export default userRoutes
