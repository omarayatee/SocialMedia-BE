import { UserRepository } from "./../../common/repository/user.repository";
import { friendRequestRepository, FriendRequestRepository } from "./../../common/repository/friendRequest.repository";
import { HydratedUser } from "../../model";
import { toObjectId } from "../../common/utils";
import { BadRequestException, ConflictException, NotFoundException } from "../../common/exception";
import { FriendRequestActionEnum, FriendRequestStatusEnum } from "../../common/enum";
import { ListDto, RespondRequestDto, SuggestionsDto } from "./dto/friend.dto";
export class FriendRequestService {
  private readonly userRepository: UserRepository;
  private readonly friendRequestRepository: FriendRequestRepository;
  constructor() {
    this.userRepository = new UserRepository();
    this.friendRequestRepository = friendRequestRepository;
  }

  //1 - sendRequest
  async sendRequest(sender: HydratedUser, receiverId: string) {
    const receiver = toObjectId(receiverId);

    //Forbidden send request to yourself
    if (sender._id.equals(receiver)) throw new BadRequestException("You cannot send a request to yourself");

    //find user
    const receiverUser = await this.userRepository.findById({ id: receiver });
    if (!receiverUser) throw new NotFoundException("User not found");

    //find user inside friends
    const alreadyFriends = await this.userRepository.findOne({
      filter: {
        _id: sender._id,
        friends: receiver,
      },
    });
    if (alreadyFriends) throw new ConflictException("You are already friends");

    //check pending status request as receiverUser
    const received = await this.friendRequestRepository.findOne({
      filter: { senderId: receiver, receiverId: sender._id, status: FriendRequestStatusEnum.PENDING },
    });
    if (received) throw new ConflictException("This user already sent you a request, accept it instead");

    const old = await this.friendRequestRepository.findOne({ filter: { senderId: sender._id, receiverId: receiver } });
    if (old) {
      if (old.status === FriendRequestStatusEnum.PENDING) throw new ConflictException("Friend request already sent");
      old.status = FriendRequestStatusEnum.PENDING;
      await old.save();
      return old;
    }

    //create request as friendRequest on userModel
    const request = await this.friendRequestRepository.create({
      data: {
        senderId: sender._id,
        receiverId: receiver,
      },
    });
    return request;
  }

  //2 - cancel Request (only the sender can cancel)
  async cancelRequest(sender: HydratedUser, receiverId: string) {
    const receiver = toObjectId(receiverId);

    const result = await this.friendRequestRepository.deleteOne({
      filter: {
        senderId: sender._id,
        receiverId: receiver,
        status: FriendRequestStatusEnum.PENDING,
      },
    });
    if (result.deletedCount == 0) throw new NotFoundException("Friend request not found");
  }

  //3 - accept or reject a request
  async respondToRequest(receiver: HydratedUser, senderId: string, { action }: RespondRequestDto) {
    const sender = toObjectId(senderId);

    const request = await this.friendRequestRepository.findOne({
      filter: {
        senderId: sender,
        receiverId: receiver._id,
        status: FriendRequestStatusEnum.PENDING,
      },
    });
    if (!request) throw new NotFoundException("Friend request not found");

    if (action === FriendRequestActionEnum.REJECT) {
      await this.friendRequestRepository.deleteOne({
        filter: { _id: request._id },
      });
      return;
    }

    await Promise.all([
      this.userRepository.updateOne({ filter: { _id: receiver._id }, update: { $addToSet: { friends: sender } } }),
      this.userRepository.updateOne({ filter: { _id: sender }, update: { $addToSet: { friends: receiver._id } } }),
    ]);

    request.status = FriendRequestStatusEnum.ACCEPTED;
    await request.save();
  }

  //4 - get received requests
  async getReceivedRequests(receiver: HydratedUser, { page, limit }: ListDto) {
    const result = await this.friendRequestRepository.paginate({
      filter: { receiverId: receiver._id, status: FriendRequestStatusEnum.PENDING },
      options: { sort: { createdAt: -1 }, populate: [{ path: "senderId", select: "firstName lastName image createdAt" }] },
      limit,
      page,
    });
    return { count: result.count, page, limit, requests: result.docs };
  }

  //5 - get sent requests
  async getSentRequests(sender: HydratedUser, { page, limit }: ListDto) {
    const result = await this.friendRequestRepository.paginate({
      filter: { senderId: sender._id, status: FriendRequestStatusEnum.PENDING },
      options: { sort: { createdAt: -1 }, populate: [{ path: "receiverId", select: "firstName lastName image createdAt" }] },
      limit,
      page,
    });
    return { count: result.count, page, limit, requests: result.docs };
  }

  //6 - get friends
  async getFriends(user: HydratedUser, { page, limit }: ListDto) {
    const me = await this.userRepository.findById({
      id: user._id,
      projection: "+friends",
    });

    const allIds = me?.friends ?? [];
    const total = allIds.length;

    const end = Math.max(total - (page - 1) * limit, 0);
    const start = Math.max(end - limit, 0);
    const pageIds = allIds.slice(start, end).reverse();

    const friends = pageIds.length
      ? await this.userRepository.find({
          filter: { _id: { $in: pageIds } },
          options: { select: "firstName lastName image" },
        })
      : [];

    return {
      count: total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
      friends,
    };
  }

  //7 - unfriend
  async unfriend(user: HydratedUser, friendId: string) {
    const friend = toObjectId(friendId);

    const isFriend = await this.userRepository.findOne({
      filter: { _id: user._id, friends: friend },
    });
    if (!isFriend) throw new NotFoundException("You are not friends with this user");

    await Promise.all([
      this.userRepository.updateOne({ filter: { _id: user._id }, update: { $pull: { friends: friend } } }),
      this.userRepository.updateOne({ filter: { _id: friend }, update: { $pull: { friends: user._id } } }),

      this.friendRequestRepository.deleteMany({
        filter: {
          status: FriendRequestStatusEnum.ACCEPTED,
          $or: [
            { senderId: user._id, receiverId: friend },
            { senderId: friend, receiverId: user._id },
          ],
        },
      }),
    ]);
  }

  //8 - get Suggestions
  async getSuggestions(user: HydratedUser, { limit }: SuggestionsDto) {
    const me = await this.userRepository.findById({ id: user._id, projection: "+friends" });
    const friendsId = me?.friends ?? [];

    const requests = await this.friendRequestRepository.find({
      filter: {
        status: FriendRequestStatusEnum.PENDING,
        $or: [{ senderId: user._id }, { receiverId: user._id }],
      },
    });

    const requestsIds = requests.map((r) => (r.senderId.equals(user._id) ? r.receiverId : r.senderId));

    const users = await this.userRepository.find({
      filter: { _id: { $nin: [user._id, ...friendsId, ...requestsIds] } },
      options: { select: "firstName lastName image", sort: { createdAt: -1 }, limit },
    });
    return users;
  }
}

export const friendRequestService = new FriendRequestService();