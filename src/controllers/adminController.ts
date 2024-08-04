import { FastifyRequest, FastifyReply } from 'fastify'
import database from '../database/database'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { env } from '../env/index'
import { userSchema } from '../validation/schema'

export default class AdminController {
  async adminRegister(request: FastifyRequest, reply: FastifyReply) {
    const token = request.headers.authorization?.split(' ')[1]

    if (!token) {
      return reply.status(401).send({ error: 'Token não fornecido' })
    }
    console.log('Token:', token)
    try {
      const admin = await database.user.findFirst({
        where: {
          token,
          admin: true,
        },
      })
      if (admin?.admin === false || !admin) {
        return reply.status(401).send({ error: 'Usuário não é administrador' })
      }
    } catch (error) {
      return reply
        .status(500)
        .send({ error: 'Erro ao verificar se o usuário é administrador' })
    }

    const { name, email, password } = request.body as {
      name: string
      email: string
      password: string
    }

    try {
      userSchema.parse({ name, email, password })
    } catch (error) {
      return reply.status(400).send({ mensage: 'Entrada Inválida' })
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
          admin: true,
        },
      })
      return reply.status(201).send({ message: 'Usuário criado com sucesso!' })
    } catch (error) {
      return reply.status(500).send({ error: 'Erro ao criar usuário!' })
    }
  }

  async adminLogin(request: FastifyRequest, reply: FastifyReply) {
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

      if (user.admin === false) {
        return reply.status(400).send({ error: 'Você não é administrador' })
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

      const adminValidation = await database.user.findFirst({
        where: { email },
        select: { admin: true },
      })

      if (!adminValidation) {
        return reply.status(400).send({ error: 'Você não é administrador' })
      }

      return reply.status(200).send({ token })
    } catch (error) {
      return reply.status(500).send({ error: 'Erro ao fazer login!' })
    }
  }

  async updateAdmin(request: FastifyRequest, reply: FastifyReply) {
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

    const adminValidation = database.user.findFirst({
      where: { id: user.id },
      select: { admin: true },
    })

    if (!adminValidation) {
      reply.status(400).send({ error: 'Usuário não é adminstrador' })
    }

    try {
      await database.user.update({ where: { id: user.id }, data: user })
      return reply
        .status(200)
        .send({ message: 'Usuário atualizado com sucesso!' })
    } catch (error) {
      return reply.status(500).send({ error: 'Erro ao atualizar usuário!' })
    }
  }

  async adminDelete(request: FastifyRequest, reply: FastifyReply) {
    const token = request.headers.authorization?.split(' ')[1]

    const user = await database.user.findFirst({ where: { token } })

    const admin = await database.user.findFirst({
      where: { token },
      select: { admin: true },
    })

    if (!user) {
      return reply.status(400).send({ error: 'Usuário não encontrado!' })
    }

    if (!admin) {
      return reply
        .status(400)
        .send({ error: 'Usuário sem permissão de administrador' })
    }

    try {
      const adminDeleted = await database.user.delete({
        where: { id: user.id },
      })
      console.log('Usuário deletado:' + adminDeleted)
      return reply
        .status(200)
        .send({ message: 'Administrador deletado com sucesso!' })
    } catch (eeror) {
      return reply.status(400).send({ error: 'Erro ao excluir o usuário' })
    }
  }

  async adminListDemands(request: FastifyRequest, reply: FastifyReply) {
    const token = request.headers.authorization?.split(' ')[1]

    if (!token) {
      return reply.status(401).send({ error: 'Token não fornecido' })
    }

    try {
      const user = await database.user.findFirst({ where: { token } })
      if (!user) {
        return reply.status(400).send({ error: 'Usuário não encontrado!' })
      }
      if (!user.admin) {
        return reply.status(401).send({ error: 'Usuário não é administrador' })
      }
      const demandas = await database.demands.findMany()
      return reply.status(200).send(demandas)
    } catch (error) {
      return reply.status(500).send({ error: 'Erro ao listar demandas' })
    }
  }

  async adminViewDemandUser(request: FastifyRequest, reply: FastifyReply) {
    const token = request.headers.authorization?.split(' ')[1]

    if (!token) {
      return reply.status(401).send({ error: 'Token não fornecido' })
    }

    try {
      const user = await database.user.findFirst({ where: { token } })
      if (!user) {
        return reply.status(400).send({ error: 'Usuário não encontrado!' })
      }
      if (!user.admin) {
        return reply.status(401).send({ error: 'Usuário não é administrador' })
      }
      let { id } = request.params as { id: number }
      id = Number(id)
      const demand = await database.demands.findFirst({ where: { id } })
      if (!demand) {
        return reply.status(400).send({ error: 'Demanda não encontrada!' })
      }
      return reply.status(200).send(demand)
    } catch (error) {
      return reply.status(500).send({ error: 'Erro ao listar demandas' })
    }
  }

  async adminDeleteDemand(request: FastifyRequest, reply: FastifyReply) {
    const token = request.headers.authorization?.split(' ')[1]

    if (!token) {
      return reply.status(401).send({ error: 'Token não fornecido' })
    }

    try {
      const user = await database.user.findFirst({ where: { token } })
      if (!user) {
        return reply.status(400).send({ error: 'Usuário não encontrado!' })
      }
      if (!user.admin) {
        return reply.status(401).send({ error: 'Usuário não é administrador' })
      }
      let { id } = request.params as { id: number }
      id = Number(id)
      const demand = await database.demands.delete({ where: { id } })
      if (!demand) {
        return reply.status(400).send({ error: 'Demanda não encontrada!' })
      }
      return reply
        .status(200)
        .send({ message: 'Demanda deletada com sucesso!' })
    } catch (error) {
      return reply.status(500).send({ error: 'Erro ao deletar demanda' })
    }
  }

  async adminUpdateDemand(request: FastifyRequest, reply: FastifyReply) {
    const token = request.headers.authorization?.split(' ')[1]

    if (!token) {
      return reply.status(401).send({ error: 'Token não fornecido' })
    }

    try {
      const user = await database.user.findFirst({ where: { token } })
      if (!user) {
        return reply.status(400).send({ error: 'Usuário não encontrado!' })
      }
      if (!user.admin) {
        return reply.status(401).send({ error: 'Usuário não é administrador' })
      }
      let { id } = request.params as { id: number }
      id = Number(id)
      const { title, description, status } = request.body as {
        title: string
        description: string
        status: string
      }

      let { feedback } = request.body as { feedback: string | null }

      if (!feedback) {
        feedback = null
      }

      if (!title || !description || !status) {
        return reply.status(400).send({ error: 'Preencha todos os campos!' })
      }
      try {
        const demand = await database.demands.update({
          where: { id },
          data: { title, description, status, feedback },
        })
        reply
          .status(200)
          .send({ message: 'Demanda atualizada com sucesso!', demand })
      } catch (error) {
        return reply.status(400).send({ error: 'Demanda não encontrada!' })
      }
    } catch (error) {
      return reply.status(500).send({ error: 'Erro ao atualizar demanda' })
    }
  }
}
