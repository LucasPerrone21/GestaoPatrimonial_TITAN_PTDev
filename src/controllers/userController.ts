import database from '../database/database'
import { FastifyRequest, FastifyReply } from 'fastify'
import bcrypt from 'bcrypt'

class UserController {
  async create(request: FastifyRequest, reply: FastifyReply) {
    const { name, email, password } = request.body as {
      name: string
      email: string
      password: string
    }

    if (!name || !email || !password) {
      return reply.status(400).send({ error: 'Preencha todos os campos!' })
    }
    const encrpytedPassword = await bcrypt.hash(password, 10)

    try {
      const uniqueEmail = await database.user.findUnique({ where: { email } })
      if (uniqueEmail) {
        return reply.status(400).send({ error: 'Email já cadastrado!' })
      }
      await database.user.create({
        data: {
          name,
          email,
          password: encrpytedPassword,
          admin: false,
        },
      })
      return reply.status(201).send({ message: 'Usuário criado com sucesso!' })
    } catch (error) {
      return reply.status(500).send({ error: 'Erro ao criar usuário!' })
    }
  }
}

export default UserController
