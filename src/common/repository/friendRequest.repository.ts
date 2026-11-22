import { FriendsRequestModel, IFriendsRequest } from "../../model";
import { DatabaseRepository } from "./base.repository";

export class FriendRequestRepository extends DatabaseRepository<IFriendsRequest> {
  constructor() {
    super(FriendsRequestModel);
  }
}

export const friendRequestRepository = new FriendRequestRepository();