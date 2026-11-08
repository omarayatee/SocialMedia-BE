import { GenderEnum, ProviderEnum, RoleEnum } from "../enum";

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
  role: RoleEnum;
  image?: string;
  coverImage?: string[];
  changeCredentialsTime?: Date;
  createdAt?: string;
  updatedAt?: string;
}