import AuthController from '../controllers/authController'
import UserController from '../controllers/userController'
import { FastifyInstance } from 'fastify'

const userController = new UserController()
const authController = new AuthController()

async function userRoutes(fastify: FastifyInstance) {
  fastify.post('/register', userController.register)
  fastify.post('/login', userController.login)
  fastify.delete(
    '/delete',
    { preValidation: [authController.checkToken] },
    userController.deleteUser,
  )
}

export default userRoutes
