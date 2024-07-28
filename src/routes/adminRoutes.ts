import AdminController from "../controllers/adminController";
import AuthController from "../controllers/authController";
import { FastifyInstance } from "fastify";

const adminController = new AdminController()
const authController = new AuthController()

async function adminRoutes(fastify: FastifyInstance) {
    fastify.post('/register', adminController.adminRegister)
    fastify.post('/login', adminController.adminLogin)
    fastify.put('/update', adminController.updateAdmin)
    fastify.delete('/delete', adminController.adminDelete)
    fastify.get('/demands/list', adminController.adminListDemands)
    fastify.get('/demands/:id', adminController.adminViewDemandUser)
}

export default adminRoutes