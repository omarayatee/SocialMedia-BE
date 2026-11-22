import { NextFunction, Request, Response, Router } from "express";
import { authentication, responseFormatter, validationMiddleware } from "../../middleware";
import { TokenTypeEnum } from "../../common/enum";
import * as validators from "./friend.validation";
import { friendRequestService } from "./friend.service";

const friendRouter = Router({ caseSensitive: true, strict: true });

// 1) Send a request → POST /friend/request/:userId   (userId = the receiver)
friendRouter.post(
  "/request/:userId",
  authentication(TokenTypeEnum.ACCESS),
  validationMiddleware(validators.userIdValidation),
  responseFormatter(async (req: Request, res: Response, next: NextFunction) => {
    const data = await friendRequestService.sendRequest(req.user, req.validate.params.userId);
    return { status: 201, data };
  }),
);

//Cancel a request I sent (userId = the receiver)
friendRouter.delete(
  "/cancel/request/:userId",
  authentication(TokenTypeEnum.ACCESS),
  validationMiddleware(validators.userIdValidation),
  responseFormatter(async (req: Request, res: Response, next: NextFunction) => {
    await friendRequestService.cancelRequest(req.user, req.validate.params.userId);
  }),
);

//Accept or reject a request (userId = the sender)
friendRouter.patch(
  "/request/response/:userId",
  authentication(TokenTypeEnum.ACCESS),
  validationMiddleware(validators.respondRequestValidation),
  responseFormatter(async (req: Request, res: Response, next: NextFunction) => {
    await friendRequestService.respondToRequest(req.user, req.validate.params.userId, req.validate.body);
  }),
);

//get Requests I received
friendRouter.get(
  "/requests/received",
  authentication(TokenTypeEnum.ACCESS),
  validationMiddleware(validators.listValidation),
  responseFormatter(async (req: Request, res: Response, next: NextFunction) => {
    const data = await friendRequestService.getReceivedRequests(req.user, req.validate.query);
    return { data };
  }),
);

//get Requests I sent
friendRouter.get(
  "/requests/sent",
  authentication(TokenTypeEnum.ACCESS),
  validationMiddleware(validators.listValidation),
  responseFormatter(async (req: Request, res: Response, next: NextFunction) => {
    const data = await friendRequestService.getSentRequests(req.user, req.validate.query);
    return { data };
  }),
);

//get Suggestions
friendRouter.get(
  "/suggestions",
  authentication(TokenTypeEnum.ACCESS),
  validationMiddleware(validators.suggestionsValidation),
  responseFormatter(async (req: Request, res: Response, next: NextFunction) => {
    const data = await friendRequestService.getSuggestions(req.user, req.validate.query);
    return { data };
  }),
);

//get My friends
friendRouter.get(
  "/",
  authentication(TokenTypeEnum.ACCESS),
  validationMiddleware(validators.listValidation),
  responseFormatter(async (req: Request, res: Response, next: NextFunction) => {
    const data = await friendRequestService.getFriends(req.user, req.validate.query);
    return { data };
  }),
);

//Unfriend (userId = the friend)
friendRouter.delete(
  "/unfriend/:userId",
  authentication(TokenTypeEnum.ACCESS),
  validationMiddleware(validators.userIdValidation),
  responseFormatter(async (req: Request, res: Response, next: NextFunction) => {
    await friendRequestService.unfriend(req.user, req.validate.params.userId);
  }),
);

export default friendRouter;