"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_dns_1 = __importDefault(require("node:dns"));
node_dns_1.default.setServers(["8.8.8.8"]);
const express_1 = __importDefault(require("express"));
const modules_1 = require("./modules");
const error_middleware_1 = require("./middleware/error.middleware");
const config_1 = require("./config");
const connection_1 = require("./DB/connection");
const app = (0, express_1.default)();
app.use(express_1.default.json());
(0, connection_1.bootstrapDB)(app, config_1.PORT);
app.all("/", async (req, res, next) => {
    return res.status(200).json({ message: "Done" });
});
app.use("/auth", modules_1.authenticationController);
app.use(error_middleware_1.globalErrorHandling);
