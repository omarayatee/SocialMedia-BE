"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorization = exports.authentication = exports.bearerAuth = void 0;
const enum_1 = require("../common/enum");
const token_service_1 = require("../common/service/token.service");
const exception_1 = require("../common/exception");
const bearerAuth = async ({ req, tokenType }) => {
    const [key, credential] = (req.headers["authorization"]?.split(" ") || []);
    const { user, payload } = await token_service_1.tokenService.decodeToken({ authorization: credential, tokenType: tokenType });
    req.user = user;
    req.payload = payload;
};
exports.bearerAuth = bearerAuth;
const authentication = async (tokenType = enum_1.TokenTypeEnum.ACCESS) => {
    return async (req, res, next) => {
        const { authorization } = req.headers;
        if (!authorization)
            throw new exception_1.UnauthorizedException("Unauthorized Account");
        const [key, credential] = (authorization.split(" ") || []);
        switch (key) {
            case "Bearer":
                await (0, exports.bearerAuth)({ req, tokenType });
                break;
            case "Basic":
                const [email, password] = Buffer.from(credential, "base64").toString()?.split(":");
                req.user = await token_service_1.tokenService.basicAuth({ email, password });
                break;
            default:
                throw new exception_1.BadRequestException("Invalid authentication");
        }
    };
};
exports.authentication = authentication;
const authorization = (accessRole) => {
    return async (req, res, next) => {
        if (req.user.role < accessRole)
            throw new exception_1.ForbiddenException("Not allowed");
        next();
    };
};
exports.authorization = authorization;
