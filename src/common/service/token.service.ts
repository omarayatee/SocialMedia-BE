import mongoose from "mongoose";
import { UserRepository } from "../repository";
import cacheService, { CacheService } from "./cache.service";
import {
  ACCESS_ADMIN_TOKEN_SIGNATURE,
  ACCESS_TOKEN_EXPIRES_IN,
  ACCESS_USER_TOKEN_SIGNATURE,
  REFRESH_ADMIN_TOKEN_SIGNATURE,
  REFRESH_TOKEN_EXPIRES_IN,
  REFRESH_USER_TOKEN_SIGNATURE,
} from "../../config";
import jwt, { JwtPayload, Secret, SignOptions } from "jsonwebtoken";
import { RoleEnum, TokenTypeEnum } from "../enum";
import { BadRequestException, NotFoundException, UnauthorizedException } from "../exception";
import { HydratedUser } from "../../model";
import { randomUUID } from "node:crypto";
import { compare } from "../security";
import { ILoginResponse } from "../../modules/authentication/entities/authentication.entities";
import { toObjectId } from "../utils/objectid";

type UserIdType = mongoose.Types.ObjectId | string;
export type JwtPayloadType = JwtPayload & {
  sub: string | mongoose.Types.ObjectId;
  aud: string | string[];
  jti: string;
  iat: number;
};

export class TokenService {
  private readonly cacheService: CacheService;
  private readonly userRepository: UserRepository;
  constructor() {
    this.cacheService = cacheService;
    this.userRepository = new UserRepository();
  }

  userBaseKey({ userId }: { userId: UserIdType }): string {
    return `User::${userId.toString()}`;
  }
  userBaseRevokeTokenKey({ userId }: { userId: UserIdType }): string {
    return `${this.userBaseKey({ userId })}::Revoke_Token`;
  }
  userRevokeTokenKey({ userId, jti }: { userId: UserIdType; jti: string }): string {
    return `${this.userBaseRevokeTokenKey({ userId })}::${jti}`;
  }

  createToken({
    payload,
    secret = ACCESS_USER_TOKEN_SIGNATURE,
    options,
  }: {
    payload: string | Buffer | object;
    secret?: Secret;
    options?: SignOptions;
  }): string {
    return jwt.sign(payload, secret, options);
  }

  verifyToken({ token, secret = ACCESS_USER_TOKEN_SIGNATURE }: { token: string; secret?: Secret }): JwtPayloadType {
    return jwt.verify(token, secret) as JwtPayloadType;
  }

  getTokenSignatures({ role = RoleEnum.USER }: { role?: RoleEnum }): { accessSignature: string; refreshSignature: string } {
    let signatures: { accessSignature: string; refreshSignature: string };
    switch (role) {
      case RoleEnum.ADMIN:
        signatures = { accessSignature: ACCESS_ADMIN_TOKEN_SIGNATURE, refreshSignature: REFRESH_ADMIN_TOKEN_SIGNATURE };
        break;
      default:
        signatures = { accessSignature: ACCESS_USER_TOKEN_SIGNATURE, refreshSignature: REFRESH_USER_TOKEN_SIGNATURE };
        break;
    }
    return signatures;
  }

  getSignature({ tokenType = TokenTypeEnum.ACCESS, role = RoleEnum.USER }: { tokenType?: TokenTypeEnum; role?: RoleEnum }): string {
    const { accessSignature, refreshSignature } = this.getTokenSignatures({ role });
    return tokenType == TokenTypeEnum.ACCESS ? accessSignature : refreshSignature;
  }

  async decodeToken({
    authorization,
    tokenType = TokenTypeEnum.ACCESS,
  }: {
    authorization: string;
    tokenType?: TokenTypeEnum;
  }): Promise<{ user: HydratedUser; payload: JwtPayloadType }> {
    const decode = jwt.decode(authorization) as JwtPayloadType;

    const payload = this.verifyToken({ token: authorization, secret: this.getSignature({ tokenType, role: decode.aud[0] as RoleEnum }) });

    if (!payload?.sub) {
      throw new BadRequestException("Missing token payload");
    }

    if (await this.cacheService.exist({ key: this.userRevokeTokenKey({ userId: payload.sub, jti: payload.jti }) })) {
      throw new UnauthorizedException("expired login credentials");
    }

    const user = await this.userRepository.findById({ id: toObjectId(payload.sub) });
    if (!user) {
      throw new NotFoundException("Invalid user account");
    }
    if ((user.changeCredentialsTime?.getTime() ?? 0) > payload.iat * 1000) {
      throw new UnauthorizedException("Expired login credentials");
    }
    return { user, payload };
  }

  createLoginCredentials({ user, issuer }: { user: HydratedUser; issuer: string }): ILoginResponse {
    const { accessSignature, refreshSignature } = this.getTokenSignatures({ role: user.role });
    const jwtid = randomUUID();
    const access_token = this.createToken({
      payload: {},
      secret: accessSignature,
      options: {
        subject: user.id,
        issuer,
        audience: [user.role],
        expiresIn: ACCESS_TOKEN_EXPIRES_IN,
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
        expiresIn: REFRESH_TOKEN_EXPIRES_IN,
        jwtid,
      },
    });
    return { access_token, refresh_token };
  }

  async createRevokeToken({ payload }: { payload: JwtPayloadType }) {
    const consumedTime = Math.ceil(Date.now() / 1000) - payload.iat;
    const ttl = REFRESH_TOKEN_EXPIRES_IN - consumedTime;
    await this.cacheService.set({ key: this.userRevokeTokenKey({ userId: payload.sub, jti: payload.jti }), value: payload.jti, ttl });
    return;
  }

  async basicAuth({ email, password }: { email: string; password: string }) {
    const account = await this.userRepository.findOne({ filter: { email } });
    if (!account) throw new NotFoundException("Invalid login data", { extra: "kil" });
    const match = await compare(password, account.password);
    if (!match) throw new NotFoundException("Invalid login data", { extra: "kil" });
    return account;
  }
}

export const tokenService = new TokenService();