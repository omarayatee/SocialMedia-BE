import { HydratedUser } from "../../model";
import { JwtPayloadType } from "../service";

declare module "express-serve-static-core" {
  interface Request {
    validate: any;
    user: HydratedUser;
    payload: JwtPayloadType;
  }
}