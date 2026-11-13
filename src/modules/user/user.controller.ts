import { NextFunction, Request, Response, Router } from "express";
import { authentication, responseFormatter, validationMiddleware } from "../../middleware";
import { TokenTypeEnum } from "../../common/enum";
import { getIssuer } from "../../common/utils";
import * as validators from "./user.validation";
import { userService } from "./user.service";

const userController = Router({ caseSensitive: true, strict: true });

userController.get(
  "/",
  authentication(TokenTypeEnum.ACCESS),
  responseFormatter(async (req: Request, res: Response, next: NextFunction) => {
    return { data: req.user };
  }),
);
userController.post(
  "/rotate-token",
  authentication(TokenTypeEnum.REFRESH),
  responseFormatter(async (req: Request, res: Response, next: NextFunction) => {
    const data = await userService.rotateTokenService(req.payload, req.user, getIssuer(req));
    console.log({ data });
    return data;
  }),
);

userController.post(
  "/logout",
  authentication(),
  responseFormatter(async (req: Request, res: Response, next: NextFunction) => {
    const data = await userService.logoutService(req.payload, req.user, req.body);
    return data;
  }),
);

userController.get(
  "/profile",
  authentication(TokenTypeEnum.ACCESS),
  responseFormatter(async (req: Request, res: Response, next: NextFunction) => {
    const data = await userService.getProfile(req.user);
    return { data };
  }),
);

userController.patch(
  "/profile",
  authentication(TokenTypeEnum.ACCESS),
  validationMiddleware(validators.updateProfileValidation),
  responseFormatter(async (req: Request, res: Response, next: NextFunction) => {
    const data = await userService.updateProfile(req.user, req.validate.body);
    return { data };
  }),
);

userController.get(
  "/profile/:userId",
  authentication(TokenTypeEnum.ACCESS),
  validationMiddleware(validators.getProfileValidation),
  responseFormatter(async (req: Request, res: Response, next: NextFunction) => {
    const data = await userService.getUserProfile(req.validate.params.userId);
    return { data };
  }),
);

export default userController;