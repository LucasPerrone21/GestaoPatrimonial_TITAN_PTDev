import database from '../database/database'
import { FastifyRequest, FastifyReply } from 'fastify'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { env } from '../env/index'

class UserController {
  async register(request: FastifyRequest, reply: FastifyReply) {
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

  async login(request: FastifyRequest, reply: FastifyReply) {
    const { email, password } = request.body as {
      email: string
      password: string
    }

    if (!email || !password) {
      return reply.status(400).send({ error: 'Preencha todos os campos!' })
    }

    try {
      const user = await database.user.findUnique({ where: { email } })
      if (!user) {
        return reply.status(400).send({ error: 'Email ou senha incorretos!' })
      }
      const passwordMatch = await bcrypt.compare(password, user.password)
      if (!passwordMatch) {
        return reply.status(400).send({ error: 'Email ou senha incorretos!' })
      }

      const token = jwt.sign({ id: user.email }, env.APP_SECRET, {
        expiresIn: '1h',
      })
      user.token = token
      await database.user.update({ where: { id: user.id }, data: { token } })
      return reply.status(200).send({ token })
    } catch (error) {
      return reply.status(500).send({ error: 'Erro ao fazer login!' })
    }
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    const { name, password, email } = request.body as {
      email: string
      name: string
      password: string
    }
    const token = request.headers.authorization?.split(' ')[1]

    const user = await database.user.findFirst({ where: { token } })

    if (!user) {
      return reply.status(400).send({ error: 'Usuário não encontrado!' })
    }

    const encrpytedPassword = await bcrypt.hash(password, 10)

    user.name = name
    user.password = encrpytedPassword
    user.email = email

    try {
      await database.user.update({ where: { id: user.id }, data: user })
      return reply
        .status(200)
        .send({ message: 'Usuário atualizado com sucesso!' })
    } catch (error) {
      return reply.status(500).send({ error: 'Erro ao atualizar usuário!' })
    }
  }

  async deleteUser(request: FastifyRequest, reply: FastifyReply) {
    const { email, password } = request.body as {
      email: string
      password: string
    }
    if (!email || !password) {
      return reply.status(400).send({ error: 'Preencha todos os campos!' })
    }
    const token = request.headers.authorization?.split(' ')[1]

    const user = await database.user.findFirst({ where: { token } })
    if (!user) {
      return reply.status(400).send({ error: 'Usuário não encontrado!' })
    }

    const passwordMatch = await bcrypt.compare(password, user.password)
    if (!passwordMatch) {
      return reply.status(400).send({ error: 'Email ou senha incorretos!' })
    }

    try {
      await database.user.delete({
        where: { email },
      })
      return reply.status(200).send({ message: 'Usuário apagado com sucesso.' })
    } catch (error) {
      return reply.status(500).send({ error: 'Erro ao apagar o usuário! ' })
    }
  }
}

export default UserController
