import fastify, { FastifyRequest, FastifyReply } from "fastify";
import database from "../database/database";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { env } from '../env/index'
import { string } from "zod";

export default class AdminController {
    async adminRegister(request: FastifyRequest, reply: FastifyReply) {
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
                admin: true,
                },
            })
            return reply.status(201).send({ message: 'Usuário criado com sucesso!' })
        }catch (error) {
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
                where: {email},
                select: {admin: true}
            })

            if (!adminValidation) {
                return reply.status(400).send({error: 'Você não é administrador'})
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
            where: {id: user.id},
            select: {admin: true}
        })

        if(!adminValidation) {
            reply.status(400).send({error: 'Usuário não é adminstrador'})
        }

        try {
            await database.user.update({ where: { id: user.id }, data: user})
            return reply.status(200).send({ message: 'Usuário atualizado com sucesso!' })
        } catch (error) {
            return reply.status(500).send({ error: 'Erro ao atualizar usuário!' })
        }
    }

    async adminDelete(request: FastifyRequest, reply: FastifyReply) {
        const token = request.headers.authorization?.split(' ')[1]

        const user = await database.user.findFirst({ where: { token } })

        const admin = await database.user.findFirst({where: {token}, select: {admin: true}})

        if (!user) {
            return reply.status(400).send({ error: 'Usuário não encontrado!' })
        }

        if (!admin) {
            return reply.status(400).send({error: 'Usuário sem permissão de administrador'})
        }

        try{
            const adminDeleted = await database.user.delete({where: {id: user.id}})
            console.log('Usuário deletado:' + adminDeleted)
            return reply.status(200).send({message: 'Administrador deletado com sucesso!'})
        } catch(eeror) {
            return reply.status(400).send({error: 'Erro ao excluir o usuário'})
        }
    }

    async adminListDemands(request: FastifyRequest, reply: FastifyReply) {
        const { email, name } = request.query as {
            email: string
            name: string
        }

        const userCatch = await database.user.findFirst({where: {email: email}})

        const token = request.headers.authorization?.split(' ')[1]

        const user = await database.user.findFirst({ where: { token } })

        const admin = await database.user.findFirst({where: {token}, select: {admin: true}})

        if (!user) {
            return reply.status(400).send({ error: 'Usuário não encontrado!' })
        }

        if (!admin) {
            return reply.status(400).send({error: 'Usuário sem permissão de administrador'})
        }

        try {
            const demands = await database.demands.findMany({where: {userId: userCatch?.id}})
            return reply.status(200).send(demands)
        } catch(error) {
            console.log(error)
            return reply.status(400).send({error: 'Não foi possível listar as demandas do usuário'})
        }
    }

    async adminViewDemandUser(request: FastifyRequest, reply: FastifyReply) {

        console.log('Query Parameters', request.query)
        const { email, title, id } = request.query as {
            email?: string;
            title?: string;
            id?: string;
        }

        console.log('Query Parameters', request.query)

        console.log('ID from Query', id)

        const idIsANumber = Number(id)

        if(isNaN(idIsANumber)) {
            return reply.status(400).send({ error: 'ID inválido!' });
        }

        console.log('Converted ID:', idIsANumber)

        const userCatch = await database.user.findFirst({where: {email: email}})

        const token = request.headers.authorization?.split(' ')[1]

        const user = await database.user.findFirst({ where: { token } })

        const admin = await database.user.findFirst({where: {token}, select: {admin: true}})

        if (!user) {
            return reply.status(400).send({ error: 'Usuário não encontrado!' })
        }

        if (!admin) {
            return reply.status(400).send({error: 'Usuário sem permissão de administrador'})
        }

        try {
            const demand = await database.demands.findFirst({where: {id: idIsANumber, userId: userCatch?.id}})
            return reply.status(200).send(demand)
        } catch(error) {
            console.log(error)
            return reply.status(400).send({error: 'Não foi possível encontrar a demanda do usuário'})
        }
    }

}