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

// src/routes/demandsRoutes.ts
var demandsRoutes_exports = {};
__export(demandsRoutes_exports, {
  default: () => demandsRoutes_default
});
module.exports = __toCommonJS(demandsRoutes_exports);

// src/database/database.ts
var import_client = require("@prisma/client");
var database = new import_client.PrismaClient();
var database_default = database;

// src/validation/schema.ts
var import_zod = require("zod");
var userSchema = import_zod.z.object({
  name: import_zod.z.string().min(2),
  email: import_zod.z.string().email(),
  password: import_zod.z.string().min(6)
});
var demandSchema = import_zod.z.object({
  title: import_zod.z.string().min(2),
  description: import_zod.z.string().min(2),
  status: import_zod.z.string().min(2)
});

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

// src/controllers/authController.ts
var import_jsonwebtoken = __toESM(require("jsonwebtoken"));

// src/env/index.ts
var import_config = require("dotenv/config");
var import_zod2 = require("zod");
console.log(typeof process.env.APP_PORT);
var envSchema = import_zod2.z.object({
  DATABASE_URL: import_zod2.z.string(),
  APP_PORT: import_zod2.z.string().default("8000"),
  APP_SECRET: import_zod2.z.string()
});
var env = envSchema.parse(process.env);

// src/controllers/authController.ts
var AuthController = class {
  checkToken(request, reply) {
    return __async(this, null, function* () {
      var _a;
      const token = (_a = request.headers.authorization) == null ? void 0 : _a.split(" ")[1];
      if (!token) {
        return reply.status(400).send({ error: "Token n\xE3o informado!" });
      }
      try {
        const decoded = yield import_jsonwebtoken.default.verify(token, env.APP_SECRET);
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

// src/routes/demandsRoutes.ts
var demandController = new demandsController_default();
var authController = new authController_default();
function demandRoutes(fastify) {
  return __async(this, null, function* () {
    fastify.post(
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
        preValidation: [authController.checkToken]
      },
      demandController.createNewDemand
    );
    fastify.get(
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
        preValidation: [authController.checkToken]
      },
      demandController.demandsList
    );
    fastify.delete(
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
        preValidation: [authController.checkToken]
      },
      demandController.demandsDelete
    );
    fastify.put(
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
        preValidation: [authController.checkToken]
      },
      demandController.demandsUpdate
    );
  });
}
var demandsRoutes_default = demandRoutes;
