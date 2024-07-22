import database from '../database/database'
import { FastifyRequest, FastifyReply } from 'fastify'

class DemandController {
    async createNewDemand (request: FastifyRequest, reply: FastifyReply) {

        const token = request.headers.authorization?.split(' ')[1]

        const user = await database.user.findFirst({where: {token} })

        if (!user) {
            return reply.status(400).send({ error: 'Usuário não encontrado'})
        }
        
        const {title, description} = request.body as {
            title: string
            description: string
        }

        if(!title || !description) {
            return reply.status(400).send({ error: 'Preencha todos os campos' })
        }

        try {
            const newDemand = await database.demands.create({
                data: {
                    title,
                    description,
                    userId: user.id,
                    status: "Avaliando...",
                },
            })
            reply.status(201).send(newDemand)
        } catch (error) {
            reply.status(500).send({ error: 'Ocorreu um erro na criação da demanda'})
        }
    }

    async demandsList(request:FastifyRequest, reply: FastifyReply){
        const token = request.headers.authorization?.split(' ')[1]

        const user = await database.user.findFirst({where: {token} })

        if (!user) {
            return reply.status(400).send({ error: 'Usuário não encontrado'})
        }

        try {
            const list = await database.demands.findMany({
                where: {
                    userId: user.id
                },
                select: {
                    title: true,
                    description: true,
                    status: true,
                    feedback: true,
                    createdAt: true,
                    updatedAt: true,
                }
            })

            reply.status(201).send(list)
        } catch(error) {
            reply.status(400).send({error: 'Ocorreu um erro na listagem das demandas'})
        }
    }
}

export default DemandController
