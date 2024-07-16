import UserController from '../controllers/userController'
import AuthController from '../controllers/authController'
import { FastifyInstance } from 'fastify'

const userController = new UserController()
const authController = new AuthController()

async function userRoutes(fastify: FastifyInstance) {
  fastify.post('/register', userController.register)
  fastify.post('/login', userController.login)
  fastify.put(
    '/update',
    { preValidation: [authController.checkToken] },
    userController.update,
  )
}

export default userRoutes
