import { NextFunction, Request, Response } from "express";
import { RoleEnum, TokenTypeEnum } from "../common/enum";
import { tokenService } from "../common/service/token.service";
import { BadRequestException, ForbiddenException, UnauthorizedException } from "../common/exception";

export const bearerAuth = async ({ req, tokenType }: { req: Request; tokenType: TokenTypeEnum }) => {
  const [key, credential] = (req.headers["authorization"]?.split(" ") || []) as [string, string];
  const { user, payload } = await tokenService.decodeToken({ authorization: credential, tokenType: tokenType });
  req.user = user;
  req.payload = payload;
};

export const authentication = async (tokenType = TokenTypeEnum.ACCESS) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const { authorization } = req.headers;
    if (!authorization) throw new UnauthorizedException("Unauthorized Account");

    const [key, credential] = (authorization.split(" ") || []) as [string, string];

    switch (key) {
      case "Bearer":
        await bearerAuth({ req, tokenType });
        break;
      case "Basic":
        const [email, password] = Buffer.from(credential, "base64").toString()?.split(":") as [string, string];
        req.user = await tokenService.basicAuth({ email, password });
        break;

      default:
        throw new BadRequestException("Invalid authentication");
    }
  };
};

export const authorization = (accessRole: RoleEnum) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (req.user.role < accessRole) throw new ForbiddenException("Not allowed");
    next();
  };
};