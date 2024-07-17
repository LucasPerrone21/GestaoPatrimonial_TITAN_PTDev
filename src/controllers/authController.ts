import { FastifyRequest, FastifyReply } from 'fastify'
import jwt from 'jsonwebtoken'
import { env } from '../env/index'
import database from '../database/database'

class AuthController {
  async checkToken(request: FastifyRequest, reply: FastifyReply) {
    const token = request.headers.authorization?.split(' ')[1]

    if (!token) {
      return reply.status(400).send({ error: 'Token não informado!' })
    }

    try {
      const decoded = await jwt.verify(token, env.APP_SECRET)

      if (!decoded) {
        return reply.status(401).send({ error: 'Token inválido!' })
      }

      return true
    } catch (error) {
      return reply.status(401).send({ error: 'Token inválido!' })
    }
  }

  async findUser(request: FastifyRequest, reply: FastifyReply) {
    const token = request.headers.authorization?.split(' ')[1]
    try {
      const user = await database.user.findFirst({ where: { token } })
      return reply.status(200).send({ user })
    } catch (error) {
      return reply.status(500).send({ error: 'Erro ao buscar usuário!' })
    }
  }
}

export default AuthController
