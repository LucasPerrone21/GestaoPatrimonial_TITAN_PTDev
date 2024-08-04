"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// src/server.ts
var import_fastify = __toESM(require("fastify"));
var import_cors = __toESM(require("@fastify/cors"));

// src/database/database.ts
var import_client = require("@prisma/client");
var database = new import_client.PrismaClient();
var database_default = database;

// src/controllers/userController.ts
var import_bcrypt = __toESM(require("bcrypt"));
var import_jsonwebtoken = __toESM(require("jsonwebtoken"));

// src/env/index.ts
var import_config = require("dotenv/config");
var import_zod = require("zod");
console.log(typeof process.env.APP_PORT);
var envSchema = import_zod.z.object({
  DATABASE_URL: import_zod.z.string(),
  APP_PORT: import_zod.z.string().default("8000"),
  APP_SECRET: import_zod.z.string()
});
var env = envSchema.parse(process.env);

// src/validation/schema.ts
var import_zod2 = require("zod");
var userSchema = import_zod2.z.object({
  name: import_zod2.z.string().min(2),
  email: import_zod2.z.string().email(),
  password: import_zod2.z.string().min(6)
});
var demandSchema = import_zod2.z.object({
  title: import_zod2.z.string().min(2),
  description: import_zod2.z.string().min(2),
  status: import_zod2.z.string().min(2)
});

// src/controllers/userController.ts
var UserController = class {
  register(request, reply) {
    return __async(this, null, function* () {
      const { name, email, password } = request.body;
      try {
        userSchema.parse({ name, email, password });
      } catch (error) {
        return reply.status(400).send({ mensage: "Entrada Inv\xE1lida" });
      }
      const encrpytedPassword = yield import_bcrypt.default.hash(password, 10);
      try {
        const uniqueEmail = yield database_default.user.findUnique({ where: { email } });
        if (uniqueEmail) {
          return reply.status(400).send({ error: "Email j\xE1 cadastrado!" });
        }
        yield database_default.user.create({
          data: {
            name,
            email,
            password: encrpytedPassword,
            admin: false
          }
        });
        return reply.status(201).send({ message: "Usu\xE1rio criado com sucesso!" });
      } catch (error) {
        return reply.status(500).send({ error: "Erro ao criar usu\xE1rio!" });
      }
    });
  }
  login(request, reply) {
    return __async(this, null, function* () {
      const { email, password } = request.body;
      if (!email || !password) {
        return reply.status(400).send({ error: "Preencha todos os campos!" });
      }
      try {
        const user = yield database_default.user.findUnique({ where: { email } });
        if (!user) {
          return reply.status(400).send({ error: "Email ou senha incorretos!" });
        }
        const passwordMatch = yield import_bcrypt.default.compare(password, user.password);
        if (!passwordMatch) {
          return reply.status(400).send({ error: "Email ou senha incorretos!" });
        }
        const token = import_jsonwebtoken.default.sign({ id: user.email }, env.APP_SECRET, {
          expiresIn: "1h"
        });
        user.token = token;
        yield database_default.user.update({ where: { id: user.id }, data: { token } });
        return reply.status(200).send({ token });
      } catch (error) {
        return reply.status(500).send({ error: "Erro ao fazer login!" });
      }
    });
  }
  update(request, reply) {
    return __async(this, null, function* () {
      var _a;
      const { name, password, email } = request.body;
      const token = (_a = request.headers.authorization) == null ? void 0 : _a.split(" ")[1];
      const user = yield database_default.user.findFirst({ where: { token } });
      if (!user) {
        return reply.status(400).send({ error: "Usu\xE1rio n\xE3o encontrado!" });
      }
      const encrpytedPassword = yield import_bcrypt.default.hash(password, 10);
      user.name = name;
      user.password = encrpytedPassword;
      user.email = email;
      try {
        yield database_default.user.update({ where: { id: user.id }, data: user });
        return reply.status(200).send({ message: "Usu\xE1rio atualizado com sucesso!" });
      } catch (error) {
        return reply.status(500).send({ error: "Erro ao atualizar usu\xE1rio!" });
      }
    });
  }
  deleteUser(request, reply) {
    return __async(this, null, function* () {
      var _a;
      const token = (_a = request.headers.authorization) == null ? void 0 : _a.split(" ")[1];
      const user = yield database_default.user.findFirst({ where: { token } });
      if (!user) {
        return reply.status(400).send({ error: "Usu\xE1rio n\xE3o encontrado!" });
      }
      try {
        yield database_default.user.delete({
          where: { id: user.id }
        });
        return reply.status(200).send({ message: "Usu\xE1rio apagado com sucesso." });
      } catch (error) {
        return reply.status(500).send({ error: "Erro ao apagar o usu\xE1rio! " });
      }
    });
  }
};
var userController_default = UserController;

// src/controllers/authController.ts
var import_jsonwebtoken2 = __toESM(require("jsonwebtoken"));
var AuthController = class {
  checkToken(request, reply) {
    return __async(this, null, function* () {
      var _a;
      const token = (_a = request.headers.authorization) == null ? void 0 : _a.split(" ")[1];
      if (!token) {
        return reply.status(400).send({ error: "Token n\xE3o informado!" });
      }
      try {
        const decoded = yield import_jsonwebtoken2.default.verify(token, env.APP_SECRET);
        if (!decoded) {
          return reply.status(401).send({ error: "Token inv\xE1lido!" });
        }
        return true;
      } catch (error) {
        return reply.status(401).send({ error: "Token inv\xE1lido!" });
      }
    });
  }
  findUser(request, reply) {
    return __async(this, null, function* () {
      var _a;
      const token = (_a = request.headers.authorization) == null ? void 0 : _a.split(" ")[1];
      try {
        const user = yield database_default.user.findFirst({ where: { token } });
        return reply.status(200).send({ user });
      } catch (error) {
        return reply.status(500).send({ error: "Erro ao buscar usu\xE1rio!" });
      }
    });
  }
};
var authController_default = AuthController;

// src/routes/userRoutes.ts
var userController = new userController_default();
var authController = new authController_default();
function userRoutes(fastify2) {
  return __async(this, null, function* () {
    fastify2.post(
      "/register",
      {
        schema: {
          tags: ["user"],
          description: "Registre um novo usu\xE1rio",
          body: {
            type: "object",
            required: ["name", "email", "password"],
            properties: {
              name: { type: "string" },
              email: { type: "string" },
              password: { type: "string" }
            }
          },
          response: {
            200: {
              description: "Usu\xE1rio registrado com sucesso",
              type: "object",
              properties: {
                name: { type: "string" },
                email: { type: "string" },
                password: { type: "string" }
              }
            }
          }
        }
      },
      userController.register
    );
    fastify2.post(
      "/login",
      {
        schema: {
          tags: ["user"],
          description: "Fa\xE7a o login de um usu\xE1rio existente",
          body: {
            type: "object",
            required: ["email", "password"],
            properties: {
              email: { type: "string" },
              password: { type: "string" }
            }
          },
          response: {
            200: {
              description: "Logado com sucesso",
              type: "object",
              properties: {
                token: { type: "string" }
              }
            }
          },
          security: [
            {
              bearerAuth: []
            }
          ]
        }
      },
      userController.login
    );
    fastify2.put(
      "/update",
      {
        schema: {
          tags: ["user"],
          description: "Atualize os dados de um usu\xE1rio",
          body: {
            type: "object",
            properties: {
              email: { type: "string" },
              name: { type: "string" },
              password: { type: "string" }
            }
          },
          response: {
            200: {
              description: "Dado atualizado com sucesso",
              type: "object",
              properties: {
                email: { type: "string" },
                name: { type: "string" },
                password: { type: "string" }
              }
            }
          },
          security: [
            {
              bearerAuth: []
            }
          ]
        },
        preValidation: [authController.checkToken]
      },
      userController.update
    );
    fastify2.delete(
      "/delete",
      {
        schema: {
          tags: ["user"],
          description: "Delete um usu\xE1rio",
          response: {
            200: {
              description: "Usu\xE1rio apagada com sucesso",
              type: "object",
              properties: {
                success: { type: "boolean" }
              }
            }
          },
          security: [
            {
              bearerAuth: []
            }
          ]
        },
        preValidation: [authController.checkToken]
      },
      userController.deleteUser
    );
  });
}
var userRoutes_default = userRoutes;

// src/controllers/demandsController.ts
var DemandController = class {
  createNewDemand(request, reply) {
    return __async(this, null, function* () {
      var _a;
      const token = (_a = request.headers.authorization) == null ? void 0 : _a.split(" ")[1];
      const user = yield database_default.user.findFirst({ where: { token } });
      if (!user) {
        return reply.status(400).send({ error: "Usu\xE1rio n\xE3o encontrado" });
      }
      const { title, description } = request.body;
      const status = "Avaliando...";
      try {
        demandSchema.parse({ title, description, status });
      } catch (error) {
        return reply.status(400).send({ error: "entrada inv\xE1lida" });
      }
      try {
        const newDemand = yield database_default.demands.create({
          data: {
            title,
            description,
            userId: user.id,
            status
          }
        });
        reply.status(201).send(newDemand);
      } catch (error) {
        reply.status(500).send({ error: "Ocorreu um erro na cria\xE7\xE3o da demanda" });
      }
    });
  }
  demandsList(request, reply) {
    return __async(this, null, function* () {
      var _a;
      const token = (_a = request.headers.authorization) == null ? void 0 : _a.split(" ")[1];
      const user = yield database_default.user.findFirst({ where: { token } });
      if (!user) {
        return reply.status(400).send({ error: "Usu\xE1rio n\xE3o encontrado" });
      }
      try {
        const list = yield database_default.demands.findMany({
          where: {
            userId: user.id
          },
          select: {
            id: true,
            title: true,
            description: true,
            status: true,
            feedback: true,
            createdAt: true,
            updatedAt: true
          }
        });
        return reply.status(201).send(list);
      } catch (error) {
        return reply.status(400).send({ error: "Ocorreu um erro na listagem das demandas" });
      }
    });
  }
  demandsDelete(request, reply) {
    return __async(this, null, function* () {
      var _a;
      const token = (_a = request.headers.authorization) == null ? void 0 : _a.split(" ")[1];
      const user = yield database_default.user.findFirst({ where: { token } });
      if (!user) {
        return reply.status(400).send({ error: "Usu\xE1rio n\xE3o encontrado" });
      }
      const { id } = request.params;
      if (!id) {
        return reply.status(400).send({ error: "Preencha os campos corretamente" });
      }
      try {
        const deleteDemand = yield database_default.demands.delete({
          where: {
            userId: user.id,
            id
          }
        });
        return reply.status(200).send(deleteDemand);
      } catch (error) {
        return reply.status(400).send({ error: "Demanda n\xE3o encontrada" });
      }
    });
  }
  demandsUpdate(request, reply) {
    return __async(this, null, function* () {
      var _a;
      const token = (_a = request.headers.authorization) == null ? void 0 : _a.split(" ")[1];
      const user = yield database_default.user.findFirst({ where: { token } });
      if (!user) {
        return reply.status(400).send({ error: "Usu\xE1rio n\xE3o encontrado" });
      }
      const { title, description } = request.body;
      let { id } = request.params;
      id = Number(id);
      if (!id || !title || !description) {
        return reply.status(400).send({ error: "Preencha os campos corretamente" });
      }
      try {
        const update = yield database_default.demands.update({
          where: {
            userId: user.id,
            id
          },
          data: {
            title,
            description
          }
        });
        return reply.status(200).send(update);
      } catch (error) {
        console.log(error);
        return reply.status(400).send({ error: "N\xE3o conseguimos atualizar a demanda" });
      }
    });
  }
};
var demandsController_default = DemandController;

// src/routes/demandsRoutes.ts
var demandController = new demandsController_default();
var authController2 = new authController_default();
function demandRoutes(fastify2) {
  return __async(this, null, function* () {
    fastify2.post(
      "/create",
      {
        schema: {
          tags: ["demands"],
          description: "Crie uma nova demanda",
          body: {
            type: "object",
            required: ["title", "description"],
            properties: {
              title: { type: "string" },
              description: { type: "string" }
            }
          },
          response: {
            201: {
              description: "Demanda criada com sucesso",
              type: "object",
              properties: {
                title: { type: "string" },
                description: { type: "string" }
              }
            }
          },
          security: [
            {
              bearerAuth: []
            }
          ]
        },
        preValidation: [authController2.checkToken]
      },
      demandController.createNewDemand
    );
    fastify2.get(
      "/list",
      {
        schema: {
          tags: ["demands"],
          description: "Listar todas as demandas",
          response: {
            200: {
              description: "Lista de demandas",
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "number" },
                  title: { type: "string" },
                  description: { type: "string" }
                }
              }
            }
          },
          security: [
            {
              bearerAuth: []
            }
          ]
        },
        preValidation: [authController2.checkToken]
      },
      demandController.demandsList
    );
    fastify2.delete(
      "/delete/:id",
      {
        schema: {
          tags: ["demands"],
          description: "Delete uma demanda",
          params: {
            type: "object",
            properties: {
              id: { type: "number" }
            },
            required: ["id"]
          },
          response: {
            200: {
              description: "Demanda apagada com sucesso",
              type: "object",
              properties: {
                success: { type: "boolean" }
              }
            }
          },
          security: [
            {
              bearerAuth: []
            }
          ]
        },
        preValidation: [authController2.checkToken]
      },
      demandController.demandsDelete
    );
    fastify2.put(
      "/update/:id",
      {
        schema: {
          tags: ["demands"],
          description: "Atualize uma demanada",
          body: {
            type: "object",
            required: ["title", "description"],
            properties: {
              id: { type: "number" },
              title: { type: "string" },
              description: { type: "string" }
            }
          },
          response: {
            200: {
              description: "Demanda atualizada com sucesso",
              type: "object",
              properties: {
                id: { type: "number" },
                title: { type: "string" }
              }
            }
          },
          security: [
            {
              bearerAuth: []
            }
          ]
        },
        preValidation: [authController2.checkToken]
      },
      demandController.demandsUpdate
    );
  });
}
var demandsRoutes_default = demandRoutes;

// src/controllers/adminController.ts
var import_bcrypt2 = __toESM(require("bcrypt"));
var import_jsonwebtoken3 = __toESM(require("jsonwebtoken"));
var AdminController = class {
  adminRegister(request, reply) {
    return __async(this, null, function* () {
      var _a;
      const token = (_a = request.headers.authorization) == null ? void 0 : _a.split(" ")[1];
      if (!token) {
        return reply.status(401).send({ error: "Token n\xE3o fornecido" });
      }
      console.log("Token:", token);
      try {
        const admin = yield database_default.user.findFirst({
          where: {
            token,
            admin: true
          }
        });
        if ((admin == null ? void 0 : admin.admin) === false || !admin) {
          return reply.status(401).send({ error: "Usu\xE1rio n\xE3o \xE9 administrador" });
        }
      } catch (error) {
        return reply.status(500).send({ error: "Erro ao verificar se o usu\xE1rio \xE9 administrador" });
      }
      const { name, email, password } = request.body;
      try {
        userSchema.parse({ name, email, password });
      } catch (error) {
        return reply.status(400).send({ mensage: "Entrada Inv\xE1lida" });
      }
      const encrpytedPassword = yield import_bcrypt2.default.hash(password, 10);
      try {
        const uniqueEmail = yield database_default.user.findUnique({ where: { email } });
        if (uniqueEmail) {
          return reply.status(400).send({ error: "Email j\xE1 cadastrado!" });
        }
        yield database_default.user.create({
          data: {
            name,
            email,
            password: encrpytedPassword,
            admin: true
          }
        });
        return reply.status(201).send({ message: "Usu\xE1rio criado com sucesso!" });
      } catch (error) {
        return reply.status(500).send({ error: "Erro ao criar usu\xE1rio!" });
      }
    });
  }
  adminLogin(request, reply) {
    return __async(this, null, function* () {
      const { email, password } = request.body;
      if (!email || !password) {
        return reply.status(400).send({ error: "Preencha todos os campos!" });
      }
      try {
        const user = yield database_default.user.findUnique({ where: { email } });
        if (!user) {
          return reply.status(400).send({ error: "Email ou senha incorretos!" });
        }
        if (user.admin === false) {
          return reply.status(400).send({ error: "Voc\xEA n\xE3o \xE9 administrador" });
        }
        const passwordMatch = yield import_bcrypt2.default.compare(password, user.password);
        if (!passwordMatch) {
          return reply.status(400).send({ error: "Email ou senha incorretos!" });
        }
        const token = import_jsonwebtoken3.default.sign({ id: user.email }, env.APP_SECRET, {
          expiresIn: "1h"
        });
        user.token = token;
        yield database_default.user.update({ where: { id: user.id }, data: { token } });
        const adminValidation = yield database_default.user.findFirst({
          where: { email },
          select: { admin: true }
        });
        if (!adminValidation) {
          return reply.status(400).send({ error: "Voc\xEA n\xE3o \xE9 administrador" });
        }
        return reply.status(200).send({ token });
      } catch (error) {
        return reply.status(500).send({ error: "Erro ao fazer login!" });
      }
    });
  }
  updateAdmin(request, reply) {
    return __async(this, null, function* () {
      var _a;
      const { name, password, email } = request.body;
      const token = (_a = request.headers.authorization) == null ? void 0 : _a.split(" ")[1];
      const user = yield database_default.user.findFirst({ where: { token } });
      if (!user) {
        return reply.status(400).send({ error: "Usu\xE1rio n\xE3o encontrado!" });
      }
      const encrpytedPassword = yield import_bcrypt2.default.hash(password, 10);
      user.name = name;
      user.password = encrpytedPassword;
      user.email = email;
      const adminValidation = database_default.user.findFirst({
        where: { id: user.id },
        select: { admin: true }
      });
      if (!adminValidation) {
        reply.status(400).send({ error: "Usu\xE1rio n\xE3o \xE9 adminstrador" });
      }
      try {
        yield database_default.user.update({ where: { id: user.id }, data: user });
        return reply.status(200).send({ message: "Usu\xE1rio atualizado com sucesso!" });
      } catch (error) {
        return reply.status(500).send({ error: "Erro ao atualizar usu\xE1rio!" });
      }
    });
  }
  adminDelete(request, reply) {
    return __async(this, null, function* () {
      var _a;
      const token = (_a = request.headers.authorization) == null ? void 0 : _a.split(" ")[1];
      const user = yield database_default.user.findFirst({ where: { token } });
      const admin = yield database_default.user.findFirst({
        where: { token },
        select: { admin: true }
      });
      if (!user) {
        return reply.status(400).send({ error: "Usu\xE1rio n\xE3o encontrado!" });
      }
      if (!admin) {
        return reply.status(400).send({ error: "Usu\xE1rio sem permiss\xE3o de administrador" });
      }
      try {
        const adminDeleted = yield database_default.user.delete({
          where: { id: user.id }
        });
        console.log("Usu\xE1rio deletado:" + adminDeleted);
        return reply.status(200).send({ message: "Administrador deletado com sucesso!" });
      } catch (eeror) {
        return reply.status(400).send({ error: "Erro ao excluir o usu\xE1rio" });
      }
    });
  }
  adminListDemands(request, reply) {
    return __async(this, null, function* () {
      var _a;
      const token = (_a = request.headers.authorization) == null ? void 0 : _a.split(" ")[1];
      if (!token) {
        return reply.status(401).send({ error: "Token n\xE3o fornecido" });
      }
      try {
        const user = yield database_default.user.findFirst({ where: { token } });
        if (!user) {
          return reply.status(400).send({ error: "Usu\xE1rio n\xE3o encontrado!" });
        }
        if (!user.admin) {
          return reply.status(401).send({ error: "Usu\xE1rio n\xE3o \xE9 administrador" });
        }
        const demandas = yield database_default.demands.findMany();
        return reply.status(200).send(demandas);
      } catch (error) {
        return reply.status(500).send({ error: "Erro ao listar demandas" });
      }
    });
  }
  adminViewDemandUser(request, reply) {
    return __async(this, null, function* () {
      var _a;
      const token = (_a = request.headers.authorization) == null ? void 0 : _a.split(" ")[1];
      if (!token) {
        return reply.status(401).send({ error: "Token n\xE3o fornecido" });
      }
      try {
        const user = yield database_default.user.findFirst({ where: { token } });
        if (!user) {
          return reply.status(400).send({ error: "Usu\xE1rio n\xE3o encontrado!" });
        }
        if (!user.admin) {
          return reply.status(401).send({ error: "Usu\xE1rio n\xE3o \xE9 administrador" });
        }
        let { id } = request.params;
        id = Number(id);
        const demand = yield database_default.demands.findFirst({ where: { id } });
        if (!demand) {
          return reply.status(400).send({ error: "Demanda n\xE3o encontrada!" });
        }
        return reply.status(200).send(demand);
      } catch (error) {
        return reply.status(500).send({ error: "Erro ao listar demandas" });
      }
    });
  }
  adminDeleteDemand(request, reply) {
    return __async(this, null, function* () {
      var _a;
      const token = (_a = request.headers.authorization) == null ? void 0 : _a.split(" ")[1];
      if (!token) {
        return reply.status(401).send({ error: "Token n\xE3o fornecido" });
      }
      try {
        const user = yield database_default.user.findFirst({ where: { token } });
        if (!user) {
          return reply.status(400).send({ error: "Usu\xE1rio n\xE3o encontrado!" });
        }
        if (!user.admin) {
          return reply.status(401).send({ error: "Usu\xE1rio n\xE3o \xE9 administrador" });
        }
        let { id } = request.params;
        id = Number(id);
        const demand = yield database_default.demands.delete({ where: { id } });
        if (!demand) {
          return reply.status(400).send({ error: "Demanda n\xE3o encontrada!" });
        }
        return reply.status(200).send({ message: "Demanda deletada com sucesso!" });
      } catch (error) {
        return reply.status(500).send({ error: "Erro ao deletar demanda" });
      }
    });
  }
  adminUpdateDemand(request, reply) {
    return __async(this, null, function* () {
      var _a;
      const token = (_a = request.headers.authorization) == null ? void 0 : _a.split(" ")[1];
      if (!token) {
        return reply.status(401).send({ error: "Token n\xE3o fornecido" });
      }
      try {
        const user = yield database_default.user.findFirst({ where: { token } });
        if (!user) {
          return reply.status(400).send({ error: "Usu\xE1rio n\xE3o encontrado!" });
        }
        if (!user.admin) {
          return reply.status(401).send({ error: "Usu\xE1rio n\xE3o \xE9 administrador" });
        }
        let { id } = request.params;
        id = Number(id);
        const { title, description, status } = request.body;
        let { feedback } = request.body;
        if (!feedback) {
          feedback = null;
        }
        if (!title || !description || !status) {
          return reply.status(400).send({ error: "Preencha todos os campos!" });
        }
        try {
          const demand = yield database_default.demands.update({
            where: { id },
            data: { title, description, status, feedback }
          });
          reply.status(200).send({ message: "Demanda atualizada com sucesso!", demand });
        } catch (error) {
          return reply.status(400).send({ error: "Demanda n\xE3o encontrada!" });
        }
      } catch (error) {
        return reply.status(500).send({ error: "Erro ao atualizar demanda" });
      }
    });
  }
};

// src/routes/adminRoutes.ts
var adminController = new AdminController();
var authController3 = new authController_default();
function adminRoutes(fastify2) {
  return __async(this, null, function* () {
    fastify2.post(
      "/register",
      {
        schema: {
          tags: ["admin"],
          description: "Registrar um novo admin",
          body: {
            type: "object",
            required: ["name", "email", "password"],
            properties: {
              name: { type: "string" },
              email: { type: "string" },
              password: { type: "string" }
            }
          },
          response: {
            201: {
              description: "Admin registrado com sucesso",
              type: "object",
              properties: {
                name: { type: "string" },
                email: { type: "string" }
              }
            }
          }
        }
      },
      adminController.adminRegister
    );
    fastify2.post(
      "/login",
      {
        schema: {
          tags: ["admin"],
          description: "Logar um admin",
          body: {
            type: "object",
            required: ["email", "password"],
            properties: {
              email: { type: "string" },
              password: { type: "string" }
            }
          },
          response: {
            200: {
              description: "Login com sucesso",
              type: "object",
              properties: {
                token: { type: "string" }
              }
            }
          },
          security: [
            {
              bearerAuth: []
            }
          ]
        }
      },
      adminController.adminLogin
    );
    fastify2.put(
      "/update",
      {
        schema: {
          tags: ["admin"],
          description: "Atualizar dados do Admin",
          body: {
            type: "object",
            properties: {
              email: { type: "string" },
              name: { type: "string" },
              password: { type: "string" }
            }
          },
          response: {
            200: {
              description: "Dados atualizados com sucesso",
              type: "object",
              properties: {
                name: { type: "string" },
                email: { type: "string" }
              }
            }
          },
          security: [
            {
              bearerAuth: []
            }
          ]
        },
        preValidation: [authController3.checkToken]
      },
      adminController.updateAdmin
    );
    fastify2.delete(
      "/delete",
      {
        schema: {
          tags: ["admin"],
          description: "Deletar um admin",
          response: {
            200: {
              description: "Admin deletado com sucesso",
              type: "object",
              properties: {
                success: { type: "boolean" }
              }
            }
          },
          security: [
            {
              bearerAuth: []
            }
          ]
        },
        preValidation: [authController3.checkToken]
      },
      adminController.adminDelete
    );
    fastify2.get(
      "/demands/list",
      {
        schema: {
          tags: ["admin"],
          description: "List todos admin",
          response: {
            200: {
              description: "List todas as demandas",
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  title: { type: "string" },
                  description: { type: "string" }
                }
              }
            }
          },
          security: [
            {
              bearerAuth: []
            }
          ]
        },
        preValidation: [authController3.checkToken]
      },
      adminController.adminListDemands
    );
    fastify2.get(
      "/demands/:id",
      {
        schema: {
          tags: ["admin"],
          description: "Ver demandas espec\xEDficas ",
          params: {
            type: "object",
            required: ["id"],
            properties: {
              id: { type: "string" }
            }
          },
          response: {
            200: {
              description: "Detalhes da demanda",
              type: "object",
              properties: {
                id: { type: "string" },
                title: { type: "string" },
                description: { type: "string" }
              }
            }
          },
          security: [
            {
              bearerAuth: []
            }
          ]
        },
        preValidation: [authController3.checkToken]
      },
      adminController.adminViewDemandUser
    );
    fastify2.delete(
      "/demands/:id",
      {
        schema: {
          tags: ["admin"],
          description: "Deletar demanda espec\xEDfica",
          params: {
            type: "object",
            required: ["id"],
            properties: {
              id: { type: "string" }
            }
          },
          response: {
            200: {
              description: "Demanda deletada com sucesso",
              type: "object",
              properties: {
                success: { type: "boolean" }
              }
            }
          },
          security: [
            {
              bearerAuth: []
            }
          ]
        },
        preValidation: [authController3.checkToken]
      },
      adminController.adminDeleteDemand
    );
    fastify2.put(
      "/demands/:id",
      {
        schema: {
          tags: ["admin"],
          description: "Atualizar demanda espec\xEDfica",
          params: {
            type: "object",
            required: ["id"],
            properties: {
              id: { type: "string" }
            }
          },
          body: {
            type: "object",
            properties: {
              title: { type: "string" },
              description: { type: "string" },
              feedback: { type: "string" },
              status: { type: "string" }
            }
          },
          response: {
            200: {
              description: "Demanda atualizada com sucesso",
              type: "object",
              properties: {
                success: { type: "boolean" }
              }
            }
          },
          security: [
            {
              bearerAuth: []
            }
          ]
        },
        preValidation: [authController3.checkToken]
      },
      adminController.adminUpdateDemand
    );
  });
}
var adminRoutes_default = adminRoutes;

// src/server.ts
var fastifySwagger = require("@fastify/swagger");
var fastifySwaggerUI = require("@fastify/swagger-ui");
var app = (0, import_fastify.default)({
  logger: {
    transport: {
      target: "pino-pretty"
    }
  }
});
app.register(import_cors.default, {
  origin: "*",
  // Permitir todas as origens. Modifique conforme necessário.
  methods: ["GET", "PUT", "POST", "DELETE"],
  // Métodos permitidos
  allowedHeaders: ["Content-Type", "Authorization"]
  // Cabeçalhos permitidos
});
app.register(fastifySwagger, {
  openapi: {
    openapi: "3.0.0",
    info: {
      title: "API PATRIMONIO",
      description: "Documenta\xE7\xE3o para nossa API de Patrimonio",
      version: "0.1.0"
    },
    servers: [
      {
        url: `http://localhost:${env.APP_PORT}`,
        description: "Development server"
      }
    ],
    tags: [
      { name: "user", description: "Rotas usu\xE1rios" },
      { name: "demands", description: "Rotas demandas" },
      { name: "admin", description: "Rotas admin" }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      }
    },
    externalDocs: {
      url: "https://swagger.io",
      description: "Find more info here"
    }
  },
  exposeRoute: true
});
app.register(fastifySwaggerUI, {
  routePrefix: "/documentation",
  uiConfig: {
    docExpansion: "full",
    deepLinking: false
  },
  staticCSP: true,
  transformSpecificationClone: true
});
app.register(userRoutes_default, { prefix: "/users" });
app.register(demandsRoutes_default, { prefix: "/demands" });
app.register(adminRoutes_default, { prefix: "/admin" });
app.listen({ port: Number(env.APP_PORT), host: "0.0.0.0" }).then(() => {
  console.log(`Server is running on port ${env.APP_PORT} \u{1F680}`);
}).catch((err) => {
  app.log.error(err);
  process.exit(1);
});
