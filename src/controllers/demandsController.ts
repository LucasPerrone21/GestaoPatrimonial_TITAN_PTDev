import database from '../database/database'
import { FastifyRequest, FastifyReply } from 'fastify'
import AuthController from './authController'

class DemandController {
    async createNewDemand (request: FastifyRequest, reply: FastifyReply) {
        const {title, description, status} = request.body as {
            title: string
            description: string
            status: string
        }

        if(!title || !description) {
            return reply.status(400).send({ error: 'Preencha todos os campos' })
        }

        try {
            const newDemand = await database.demands.create({
                data: {
                    title,
                    description,
                    status: "Avaliando...",
                },
            })
            reply.status(201).send(newDemand)
        } catch (error) {
            reply.status(500).send({ error: 'Ocorreu um erro na criação da demanda'})
        }
    }
}

export default DemandController