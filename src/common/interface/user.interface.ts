import mongoose from "mongoose";
import { GenderEnum, ProviderEnum, RoleEnum, StatusEnum } from "../enum";

export interface IUser {
  firstName: string;
  lastName: string;
  username?: string;
  email: string;
  confirmEmail: string;
  password: string;
  phone?: string;
  gender: GenderEnum;
  DOB: string;
  provider: ProviderEnum;
  status: StatusEnum;
  role: RoleEnum;
  image?: string;
  coverImage?: string[];
  friends?: mongoose.Types.ObjectId[];
  changeCredentialsTime?: Date;
  changeStatusAt?: Date;
  createdAt?: string;
  updatedAt?: string;
  isPrivate?: boolean;
}