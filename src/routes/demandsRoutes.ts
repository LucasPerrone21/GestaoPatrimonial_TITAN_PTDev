import DemandController from '../controllers/demandsController'
import { FastifyInstance } from 'fastify'

const demandController = new DemandController()

async function demandRoutes(fastify: FastifyInstance) {
    fastify.post('/create', demandController.createNewDemand)
    fastify.get('/list', demandController.demandsList)
}

export default demandRoutes