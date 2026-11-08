import { NextFunction, Request, Response } from "express";
import { LanguageEnum } from "../common/enum";
import { ZodType } from "zod";
import { BadRequestException } from "../common/exception";

type validationSchemaType = (lang: LanguageEnum) => ZodType;
export const validationMiddleware = (schema: validationSchemaType) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const lang = Number(req.headers["lang"]) || LanguageEnum.EN;

    const validationResult = schema(lang).safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    if (!validationResult.success) {
      throw new BadRequestException(
        "Validation Error",
        validationResult.error.issues
      );
    }
    req.validate = validationResult.data;
    next();
  };
};