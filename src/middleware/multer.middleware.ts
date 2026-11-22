import { NextFunction, Request, RequestHandler, Response } from "express";
import { processMulterUpload } from "../common/utils/multer";

export const uploadMiddleware = ({
  multerMiddleware,
  customPath = "general",
  isRequired = true,
  validation,
}: {
  multerMiddleware: RequestHandler;
  customPath?: string;
  isRequired?: boolean;
  validation: string[];
}) => {
  return (req: Request, res: Response, next: NextFunction) => {
    multerMiddleware(req, res, async (error) => {
      if (error) {
        next(new Error(error.message, { cause: { status: 400 } }));
        return;
      }
      try {
        await processMulterUpload({ req, customPath, isRequired, validation });
        next();
      } catch (error: any) {
        next(new Error(error.message, { cause: { status: 400 } }));
      }
    });
  };
};