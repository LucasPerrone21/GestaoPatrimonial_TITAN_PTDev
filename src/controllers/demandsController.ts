import database from '../database/database'
import { FastifyRequest, FastifyReply } from 'fastify'
import { demandSchema } from '../validation/schema'

class DemandController {
  async createNewDemand(request: FastifyRequest, reply: FastifyReply) {
    const token = request.headers.authorization?.split(' ')[1]

    const user = await database.user.findFirst({ where: { token } })

    if (!user) {
      return reply.status(400).send({ error: 'Usuário não encontrado' })
    }

    const { title, description } = request.body as {
      title: string
      description: string
    }
    const status = 'Avaliando...'

    try {
      demandSchema.parse({ title, description, status })
    } catch (error) {
      return reply.status(400).send({ error: 'entrada inválida' })
    }

    try {
      const newDemand = await database.demands.create({
        data: {
          title,
          description,
          userId: user.id,
          status,
        },
      })
      reply.status(201).send(newDemand)
    } catch (error) {
      reply.status(500).send({ error: 'Ocorreu um erro na criação da demanda' })
    }
  }

  async demandsList(request: FastifyRequest, reply: FastifyReply) {
    const token = request.headers.authorization?.split(' ')[1]

    const user = await database.user.findFirst({ where: { token } })

    if (!user) {
      return reply.status(400).send({ error: 'Usuário não encontrado' })
    }

    try {
      const list = await database.demands.findMany({
        where: {
          userId: user.id,
        },
        select: {
          id: true,
          title: true,
          description: true,
          status: true,
          feedback: true,
          createdAt: true,
          updatedAt: true,
        },
      })

      return reply.status(201).send(list)
    } catch (error) {
      return reply
        .status(400)
        .send({ error: 'Ocorreu um erro na listagem das demandas' })
    }
  }

  async demandsDelete(request: FastifyRequest, reply: FastifyReply) {
    const token = request.headers.authorization?.split(' ')[1]

    const user = await database.user.findFirst({ where: { token } })

    if (!user) {
      return reply.status(400).send({ error: 'Usuário não encontrado' })
    }

    const { id } = request.params as { id: number }

    if (!id) {
      return reply
        .status(400)
        .send({ error: 'Preencha os campos corretamente' })
    }

    try {
      const deleteDemand = await database.demands.delete({
        where: {
          userId: user.id,
          id,
        },
      })
      return reply.status(200).send(deleteDemand)
    } catch (error) {
      return reply.status(400).send({ error: 'Demanda não encontrada' })
    }
  }

  async demandsUpdate(request: FastifyRequest, reply: FastifyReply) {
    const token = request.headers.authorization?.split(' ')[1]

    const user = await database.user.findFirst({ where: { token } })

    if (!user) {
      return reply.status(400).send({ error: 'Usuário não encontrado' })
    }

    const { title, description } = request.body as {
      title: string
      description: string
    }
    let { id } = request.params as { id: number }
    id = Number(id)

    if (!id || !title || !description) {
      return reply
        .status(400)
        .send({ error: 'Preencha os campos corretamente' })
    }

    try {
      const update = await database.demands.update({
        where: {
          userId: user.id,
          id,
        },
        data: {
          title,
          description,
        },
      })
      return reply.status(200).send(update)
    } catch (error) {
      console.log(error)
      return reply
        .status(400)
        .send({ error: 'Não conseguimos atualizar a demanda' })
    }
  }
}

export default DemandController
