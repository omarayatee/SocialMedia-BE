"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tokenService = exports.TokenService = void 0;
const repository_1 = require("../repository");
const cache_service_1 = __importDefault(require("./cache.service"));
const config_1 = require("../../config");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const enum_1 = require("../enum");
const exception_1 = require("../exception");
const node_crypto_1 = require("node:crypto");
const security_1 = require("../security");
const objectid_1 = require("../utils/objectid");
class TokenService {
    cacheService;
    userRepository;
    constructor() {
        this.cacheService = cache_service_1.default;
        this.userRepository = new repository_1.UserRepository();
    }
    userBaseKey({ userId }) {
        return `User::${userId.toString()}`;
    }
    userBaseRevokeTokenKey({ userId }) {
        return `${this.userBaseKey({ userId })}::Revoke_Token`;
    }
    userRevokeTokenKey({ userId, jti }) {
        return `${this.userBaseRevokeTokenKey({ userId })}::${jti}`;
    }
    createToken({ payload, secret = config_1.ACCESS_USER_TOKEN_SIGNATURE, options, }) {
        return jsonwebtoken_1.default.sign(payload, secret, options);
    }
    verifyToken({ token, secret = config_1.ACCESS_USER_TOKEN_SIGNATURE }) {
        return jsonwebtoken_1.default.verify(token, secret);
    }
    getTokenSignatures({ role = enum_1.RoleEnum.USER }) {
        let signatures;
        switch (role) {
            case enum_1.RoleEnum.ADMIN:
                signatures = { accessSignature: config_1.ACCESS_ADMIN_TOKEN_SIGNATURE, refreshSignature: config_1.REFRESH_ADMIN_TOKEN_SIGNATURE };
                break;
            default:
                signatures = { accessSignature: config_1.ACCESS_USER_TOKEN_SIGNATURE, refreshSignature: config_1.REFRESH_USER_TOKEN_SIGNATURE };
                break;
        }
        return signatures;
    }
    getSignature({ tokenType = enum_1.TokenTypeEnum.ACCESS, role = enum_1.RoleEnum.USER }) {
        const { accessSignature, refreshSignature } = this.getTokenSignatures({ role });
        return tokenType == enum_1.TokenTypeEnum.ACCESS ? accessSignature : refreshSignature;
    }
    async decodeToken({ authorization, tokenType = enum_1.TokenTypeEnum.ACCESS, }) {
        const decode = jsonwebtoken_1.default.decode(authorization);
        const payload = this.verifyToken({ token: authorization, secret: this.getSignature({ tokenType, role: decode.aud[0] }) });
        if (!payload?.sub) {
            throw new exception_1.BadRequestException("Missing token payload");
        }
        if (await this.cacheService.exist({ key: this.userRevokeTokenKey({ userId: payload.sub, jti: payload.jti }) })) {
            throw new exception_1.UnauthorizedException("expired login credentials");
        }
        const user = await this.userRepository.findById({ id: (0, objectid_1.toObjectId)(payload.sub) });
        if (!user) {
            throw new exception_1.NotFoundException("Invalid user account");
        }
        if ((user.changeCredentialsTime?.getTime() ?? 0) > payload.iat * 1000) {
            throw new exception_1.UnauthorizedException("Expired login credentials");
        }
        return { user, payload };
    }
    createLoginCredentials({ user, issuer }) {
        const { accessSignature, refreshSignature } = this.getTokenSignatures({ role: user.role });
        const jwtid = (0, node_crypto_1.randomUUID)();
        const access_token = this.createToken({
            payload: {},
            secret: accessSignature,
            options: {
                subject: user.id,
                issuer,
                audience: [user.role],
                expiresIn: config_1.ACCESS_TOKEN_EXPIRES_IN,
                jwtid,
            },
        });
        const refresh_token = this.createToken({
            payload: {},
            secret: refreshSignature,
            options: {
                subject: user.id,
                issuer,
                audience: [user.role],
                expiresIn: config_1.REFRESH_TOKEN_EXPIRES_IN,
                jwtid,
            },
        });
        return { access_token, refresh_token };
    }
    async createRevokeToken({ payload }) {
        const consumedTime = Math.ceil(Date.now() / 1000) - payload.iat;
        const ttl = config_1.REFRESH_TOKEN_EXPIRES_IN - consumedTime;
        await this.cacheService.set({ key: this.userRevokeTokenKey({ userId: payload.sub, jti: payload.jti }), value: payload.jti, ttl });
        return;
    }
    async basicAuth({ email, password }) {
        const account = await this.userRepository.findOne({ filter: { email } });
        if (!account)
            throw new exception_1.NotFoundException("Invalid login data", { extra: "kil" });
        const match = await (0, security_1.compare)(password, account.password);
        if (!match)
            throw new exception_1.NotFoundException("Invalid login data", { extra: "kil" });
        return account;
    }
}
exports.TokenService = TokenService;
exports.tokenService = new TokenService();
