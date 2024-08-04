"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
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

// src/routes/adminRoutes.ts
var adminRoutes_exports = {};
__export(adminRoutes_exports, {
  default: () => adminRoutes_default
});
module.exports = __toCommonJS(adminRoutes_exports);

// src/database/database.ts
var import_client = require("@prisma/client");
var database = new import_client.PrismaClient();
var database_default = database;

// src/controllers/adminController.ts
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

// src/controllers/adminController.ts
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
        const passwordMatch = yield import_bcrypt.default.compare(password, user.password);
        if (!passwordMatch) {
          return reply.status(400).send({ error: "Email ou senha incorretos!" });
        }
        const token = import_jsonwebtoken.default.sign({ id: user.email }, env.APP_SECRET, {
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
      const encrpytedPassword = yield import_bcrypt.default.hash(password, 10);
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

// src/routes/adminRoutes.ts
var adminController = new AdminController();
var authController = new authController_default();
function adminRoutes(fastify) {
  return __async(this, null, function* () {
    fastify.post(
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
    fastify.post(
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
    fastify.put(
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
        preValidation: [authController.checkToken]
      },
      adminController.updateAdmin
    );
    fastify.delete(
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
        preValidation: [authController.checkToken]
      },
      adminController.adminDelete
    );
    fastify.get(
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
        preValidation: [authController.checkToken]
      },
      adminController.adminListDemands
    );
    fastify.get(
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
        preValidation: [authController.checkToken]
      },
      adminController.adminViewDemandUser
    );
    fastify.delete(
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
        preValidation: [authController.checkToken]
      },
      adminController.adminDeleteDemand
    );
    fastify.put(
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
        preValidation: [authController.checkToken]
      },
      adminController.adminUpdateDemand
    );
  });
}
var adminRoutes_default = adminRoutes;
