import mongoose, { HydratedDocument } from "mongoose";
import { IUser } from "../common/interface";
import { GenderEnum, ProviderEnum, RoleEnum } from "../common/enum";

const userSchema = new mongoose.Schema<IUser>(
  {
    firstName: {
      type: String,
      required: true,
      minLength: 2,
      maxLength: 25,
    },

    lastName: {
      type: String,
      required: true,
      minLength: 2,
      maxLength: 25,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },
    confirmEmail: { type: String },
    password: {
      type: String,
      required: function (this: IUser): boolean {
        return this.provider == ProviderEnum.SYSTEM;
      },
    },
    gender: {
      type: String,
      default: GenderEnum.MALE,
      enum: GenderEnum,
    },
    role: {
      type: String,
      default: RoleEnum.USER,
      enum: RoleEnum,
    },
    provider: {
      type: String,
      default: ProviderEnum.SYSTEM,
      enum: ProviderEnum,
    },
    phone: String,
    DOB: Date,
    image: String,
    coverImage: [String],
    changeCredentialsTime: Date,
  },
  {
    timestamps: true,
    strictQuery: true,
    autoIndex: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  },
);

userSchema
  .virtual("username")
  .set(function (value) {
    const [firstName, lastName] = value?.split(" ") || [];
    this.set({ firstName, lastName });
  })
  .get(function () {
    return `${this.firstName} ${this.lastName}`;
  });

export const UserModel = mongoose.model<IUser>("User", userSchema);
export type HydratedUser = HydratedDocument<IUser>;