import mongoose, { HydratedDocument } from "mongoose";
import { FriendRequestStatusEnum } from "../common/enum";

export interface IFriendsRequest {
  senderId: mongoose.Types.ObjectId;
  receiverId: mongoose.Types.ObjectId;
  status: FriendRequestStatusEnum;
  createdAt: Date;
  updatedAt: Date;
}

const friendRequestSchema = new mongoose.Schema<IFriendsRequest>(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: { type: String, enum: FriendRequestStatusEnum, default: FriendRequestStatusEnum.PENDING },
  },
  { timestamps: true },
);

friendRequestSchema.index(
  { senderId: 1, receiverId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: FriendRequestStatusEnum.PENDING,
    },
  },
);
friendRequestSchema.index({
  receiverId: 1,
  status: 1,
  createdAt: -1,
});

export const FriendsRequestModel = mongoose.model<IFriendsRequest>("FriendRequest", friendRequestSchema);

export type hydratedFriendRequest = HydratedDocument<IFriendsRequest>;