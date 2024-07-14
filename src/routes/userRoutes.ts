import UserController from '../controllers/userController'
import { FastifyInstance } from 'fastify'

const userController = new UserController()

async function userRoutes(fastify: FastifyInstance) {
  fastify.post('/register', userController.register)
  fastify.post('/login', userController.login)
  fastify.delete('/delete', userController.deleteUser)
}

export default userRoutes
