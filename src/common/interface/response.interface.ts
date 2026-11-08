import { Response } from "express";
export interface IResponse<T=any , Z=any> {
  res: Response;
  message?: boolean;
  data?: T;
  extra?: Z;
  status?: number;
}
