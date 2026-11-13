import { NextFunction, Request, Response, Router } from "express";
import { authentication, responseFormatter, validationMiddleware } from "../../middleware";
import { TokenTypeEnum } from "../../common/enum";
import * as validators from "./follow.validation";
import { followService } from "./follow.service";

const followRouter = Router({ caseSensitive: true, strict: true });

followRouter.post(
  "/:userId",
  authentication(TokenTypeEnum.ACCESS),
  validationMiddleware(validators.followValidation),
  responseFormatter(async (req: Request, res: Response, next: NextFunction) => {
    await followService.follow(req.user, req.validate.params.userId);
    return { status: 201 };
  }),
);
followRouter.delete(
  "/unfollow/:userId",
  authentication(TokenTypeEnum.ACCESS),
  validationMiddleware(validators.followValidation),
  responseFormatter(async (req: Request, res: Response, next: NextFunction) => {
    await followService.unfollow(req.user, req.validate.params.userId);
  }),
);

followRouter.get(
  "/:userId/followers",
  authentication(TokenTypeEnum.ACCESS),
  validationMiddleware(validators.followListValidation),
  responseFormatter(async (req: Request, res: Response, next: NextFunction) => {
    const data = await followService.getFollowers(req.validate.params.userId, req.validate.query);
    return { data };
  }),
);

followRouter.get(
  "/:userId/following",
  authentication(TokenTypeEnum.ACCESS),
  validationMiddleware(validators.followListValidation),
  responseFormatter(async (req: Request, res: Response, next: NextFunction) => {
    const data = await followService.getFollowing(req.validate.params.userId, req.validate.query);
    return { data };
  }),
);
export default followRouter;