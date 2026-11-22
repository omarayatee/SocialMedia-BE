import { HydratedUser } from "../../model";
import { JwtPayloadType } from "../service/token.service";

declare module "express-serve-static-core" {
  interface Request {
    validate: any;
    user: HydratedUser;
    payload: JwtPayloadType;
  }
}
export type IFile = Express.Multer.File;