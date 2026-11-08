import { NextFunction, Request, Response } from "express";
import { IResponse } from "../common/interface/response.interface";
export const responseFormatter = (handler: Function) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> => {
    const {
      status = 200,
      message = true,
      data = undefined,
      extra = undefined,
    }: IResponse = (await handler(req, res, next)) || {};

    // console.log(res.headersSent);
    if (res.headersSent) return;

    return res.status(status).json({
      message,
      data,
      extra,
      status,
    });
  };
};
