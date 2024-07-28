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

// src/controllers/userController.ts
var UserController = class {
  register(request, reply) {
    return __async(this, null, function* () {
      const { name, email, password } = request.body;
      if (!name || !email || !password) {
        return reply.status(400).send({ error: "Preencha todos os campos!" });
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
    fastify2.post("/register", userController.register);
    fastify2.post("/login", userController.login);
    fastify2.put(
      "/update",
      { preValidation: [authController.checkToken] },
      userController.update
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
      if (!title || !description) {
        return reply.status(400).send({ error: "Preencha todos os campos" });
      }
      try {
        const newDemand = yield database_default.demands.create({
          data: {
            title,
            description,
            userId: user.id,
            status: "Avaliando..."
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
      const { id, title } = request.body;
      if (!id || !title) {
        return reply.status(400).send({ error: "Preencha os campos corretamente" });
      }
      try {
        const deleteDemand = yield database_default.demands.delete({
          where: {
            userId: user.id,
            id,
            title
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
      const { id, title, description } = request.body;
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
        return reply.status(400).send({ error: "N\xE3o conseguimos atualizar a demanda" });
      }
    });
  }
};
var demandsController_default = DemandController;

// src/routes/demandsRoutes.ts
var demandController = new demandsController_default();
function demandRoutes(fastify2) {
  return __async(this, null, function* () {
    fastify2.post("/create", demandController.createNewDemand);
    fastify2.get("/list", demandController.demandsList);
    fastify2.delete("/delete/:id", demandController.demandsDelete);
    fastify2.post("/update", demandController.demandsUpdate);
  });
}
var demandsRoutes_default = demandRoutes;

// src/server.ts
var app = (0, import_fastify.default)({
  logger: {
    transport: {
      target: "pino-pretty"
    }
  }
});
app.register(userRoutes_default, { prefix: "/users" });
app.register(demandsRoutes_default, { prefix: "/demands" });
app.listen({ port: Number(env.APP_PORT), host: "0.0.0.0" }).then(() => {
  console.log(`Server is running on port ${env.APP_PORT} \u{1F680}`);
}).catch((err) => {
  app.log.error(err);
  process.exit(1);
});
