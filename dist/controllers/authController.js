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

// src/controllers/authController.ts
var authController_exports = {};
__export(authController_exports, {
  default: () => authController_default
});
module.exports = __toCommonJS(authController_exports);
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

// src/database/database.ts
var import_client = require("@prisma/client");
var database = new import_client.PrismaClient();
var database_default = database;

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
