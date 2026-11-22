import { NextFunction, Request, Response, Router } from "express";
import { authentication, responseFormatter, uploadMiddleware, validationMiddleware } from "../../middleware";
import { StorageEnum, TokenTypeEnum } from "../../common/enum";
import { userService } from "./user.service";
import { getIssuer } from "../../common/utils";
import * as validators from "./user.validation";
import { fileValidation, localFileUpload } from "../../common/utils/multer";
import { IFile } from "../../common/types/express.types";
import { IResponse, IUser } from "../../common/interface";

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

userController.get(
  "/search",
  authentication(TokenTypeEnum.ACCESS),
  validationMiddleware(validators.searchValidation),
  responseFormatter(async (req: Request, res: Response, next: NextFunction) => {
    const data = await userService.searchUsersService(req.user, req.validate.query);
    return { data };
  }),
);

userController.patch(
  "/profile-image",
  authentication(TokenTypeEnum.ACCESS),
  uploadMiddleware({
    multerMiddleware: localFileUpload({}).single("attachment"),
    validation: fileValidation.image,
    customPath: "User",
  }),
  responseFormatter(async (req: Request, res: Response, next: NextFunction): Promise<IResponse<IUser>> => {
    const account = await userService.profileImage(req.file as IFile, req.user);
    return { res, data: account };
  }),
);

userController.patch(
  "/settings/privacy",
  authentication(TokenTypeEnum.ACCESS),
  validationMiddleware(validators.privacyValidation),
  responseFormatter(async (req: Request, res: Response, next: NextFunction) => {
    const data = await userService.privacyStatus(req.user, req.validate.body);
    return { data };
  }),
);

export default userController;