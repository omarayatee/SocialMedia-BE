import { Router, Request, Response, NextFunction } from "express";
import { responseFormatter, validationMiddleware } from "../../middleware";
import authService from "./authentication.service";
import { IResponse } from "./../../common/interface/response.interface";
import * as validators from "./authentication.validation";
import { IUser } from "../../common/interface";
import { getIssuer } from "../../common/utils";
import { ILoginResponse, ISignupWithGmailResponse } from "./entities/authentication.entities";
const authenticationController = Router({ strict: true, caseSensitive: true });

authenticationController.post(
  "/signup",
  validationMiddleware(validators.signupValidation),
  responseFormatter(async (req: Request, res: Response, next: NextFunction): Promise<IResponse<IUser>> => {
    const data = await authService.signupService(req.validate.body);
    return { res, status: 201, data };
  }),
);
authenticationController.post(
  "/signup-with-gmail",
  responseFormatter(async (req: Request, res: Response, next: NextFunction): Promise<IResponse<ISignupWithGmailResponse>> => {
    const data = await authService.signupWithGmail(req.body, getIssuer(req));
    return { res, data };
  }),
);
authenticationController.patch(
  "/confirm-email",
  validationMiddleware(validators.confirmEmailValidation),
  responseFormatter(async (req: Request, res: Response, next: NextFunction) => {
    await authService.confirmEmailService(req.body);
  }),
);
authenticationController.patch(
  "/resend-confirm-email",
  validationMiddleware(validators.resendConfirmEmailValidation),
  responseFormatter(async (req: Request, res: Response, next: NextFunction) => {
    await authService.resendConfirmEmail(req.body);
  }),
);

authenticationController.post(
  "/login",
  validationMiddleware(validators.loginValidation),
  responseFormatter(async (req: Request, res: Response, next: NextFunction): Promise<IResponse<ILoginResponse>> => {
    const data = await authService.loginService(req.validate.body, getIssuer(req));
    return { res, status: 201, data };
  }),
);
authenticationController.post(
  "/forgot-password",
  validationMiddleware(validators.forgotPasswordValidation),
  responseFormatter(async (req: Request, res: Response, next: NextFunction) => {
    console.log(req.body);

    await authService.forgotPasswordService(req.body);
  }),
);

authenticationController.post(
  "/reset-password",
  validationMiddleware(validators.resetPasswordValidation),
  responseFormatter(async (req: Request, res: Response, next: NextFunction) => {
    await authService.resetPasswordService(req.body);
  }),
);

export default authenticationController;