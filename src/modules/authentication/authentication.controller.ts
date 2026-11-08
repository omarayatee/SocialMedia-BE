import { Router, Request, Response, NextFunction } from "express";
import { responseFormatter, validationMiddleware } from "../../middleware";
import authService from "./authentication.service";
import { IResponse } from "./../../common/interface/response.interface";
import * as validators from "./authentication.validation";
import { IUser } from "../../common/interface";
import { getIssuer } from "../../common/utils";
import { ILoginResponse } from "./entities/authentication.entities";
const router = Router({ strict: true, caseSensitive: true });

router.post(
  "/signup",
  validationMiddleware(validators.signupValidation),
  responseFormatter(async (req: Request, res: Response, next: NextFunction): Promise<IResponse<IUser>> => {
    const data = await authService.signupService(req.validate.body);
    return { res, status: 201, data };
  }),
);
router.patch(
  "/confirm-email",
  validationMiddleware(validators.confirmEmail),
  responseFormatter(async (req: Request, res: Response, next: NextFunction) => {
    await authService.confirmEmailService(req.body);
  }),
);
router.patch(
  "/resend-confirm-email",
  validationMiddleware(validators.resendConfirmEmail),
  responseFormatter(async (req: Request, res: Response, next: NextFunction) => {
    await authService.resendConfirmEmail(req.body);
  }),
);

router.post(
  "/login",
  validationMiddleware(validators.loginValidation),
  responseFormatter(async (req: Request, res: Response, next: NextFunction): Promise<IResponse<ILoginResponse>> => {
    const data = await authService.loginService(req.validate.body, getIssuer(req));
    return { res, status: 201, data };
  }),
);

export default router;