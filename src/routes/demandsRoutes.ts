import DemandController from '../controllers/demandsController'
import { FastifyInstance } from 'fastify'

const demandController = new DemandController()

async function demandRoutes(fastify: FastifyInstance) {
    fastify.post('/create', demandController.createNewDemand)
}

export default demandRoutes