import { NextFunction, Request, Response, Router } from "express";
import { authentication, responseFormatter, uploadMiddleware, validationMiddleware } from "../../middleware";
import { StorageEnum, TokenTypeEnum } from "../../common/enum";
import { postService } from "./post.service";
import { fileValidation, localFileUpload } from "../../common/utils/multer";
import * as validators from "./post.validation";
const postRouter = Router({ caseSensitive: true, strict: true });

postRouter.post(
  "/create-post",
  authentication(TokenTypeEnum.ACCESS),
  uploadMiddleware({
    multerMiddleware: localFileUpload({ storageApproach: StorageEnum.DISK }).single("image"),
    validation: fileValidation.image,
    customPath: "Post",
    isRequired: false,
  }),
  validationMiddleware(validators.createPostValidation),
  responseFormatter(async (req: Request, res: Response, next: NextFunction) => {
    const data = await postService.createPost(req.user, req.validate.body, req.file);
    return { status: 201, data };
  }),
);

export default postRouter;