import mongoose, { HydratedDocument } from "mongoose";
import { GenderEnum, ProviderEnum, RoleEnum, StatusEnum } from "../common/enum";
import { IUser } from "../common/interface";
import { encryptionSecurity, hash } from "../common/security";

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
      required: function (): boolean {
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
    status: {
      type: String,
      default: StatusEnum.ACTIVE,
      enum: StatusEnum,
    },
    isPrivate: {
      type: Boolean,
      default: false,
    },
    friends: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      default: [],
    },
    phone: String,
    DOB: Date,
    image: String,
    coverImage: [String],
    changeCredentialsTime: Date,
    changeStatusAt: Date,
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

userSchema.pre("save", async function () {
  if (this.isModified("password")) {
    this.password = await hash(this.password);
  }
  if (this.isModified("phone")) {
    this.phone = await encryptionSecurity(this.phone as string);
  }
});

userSchema.pre(["findOne", "find", "countDocuments"], function () {
  const query = this.getFilter();
  // console.log({ query });

  if (query.paranoid != false) this.setQuery({ ...query, status: { $ne: StatusEnum.ARCHIVE } });
});

userSchema.pre(["updateOne", "updateMany", "findOneAndUpdate"], function () {
  const query = this.getFilter();
  // console.log({ query });

  const update = this.getUpdate() as HydratedUser;
  if (update.status == StatusEnum.ACTIVE) {
    this.setQuery({ ...query, status: { $eq: StatusEnum.ARCHIVE } });
  } else if (update.status == StatusEnum.ARCHIVE) {
    this.setQuery({ ...query, status: { $eq: StatusEnum.ACTIVE } });
  }
  if (!update.status && query.paranoid != false) {
    this.setQuery({ ...query, status: { $eq: StatusEnum.ACTIVE } });
  }

  this.setUpdate({
    ...update,
    ...(update.status ? { changeStatusAt: new Date() } : {}),
  });
});

userSchema.pre(["deleteOne", "deleteMany", "findOneAndDelete"], function () {
  const query = this.getFilter();
  if (!query.force) {
    this.setQuery({ ...query, status: { $eq: StatusEnum.ARCHIVE } });
  }
});

export const UserModel = mongoose.model<IUser>("User", userSchema);
export type HydratedUser = HydratedDocument<IUser>;