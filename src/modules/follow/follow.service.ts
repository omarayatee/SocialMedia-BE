import { BadRequestException, NotFoundException } from "../../common/exception";
import { FollowRepository, UserRepository } from "../../common/repository";
import { HydratedUser } from "../../model";
import { toObjectId } from "./../../common/utils/objectid";

export class FollowService {
  private readonly followRepository: FollowRepository;
  private readonly userRepository: UserRepository;
  constructor() {
    this.followRepository = new FollowRepository();
    this.userRepository = new UserRepository();
  }

  async follow(user: HydratedUser, targetId: string) {
    const target = toObjectId(targetId);

    if (user._id.equals(target)) throw new BadRequestException("You cannot follow yourself");

    const targetUser = await this.userRepository.findById({ id: target });
    if (!targetUser) throw new NotFoundException("User not found");

    const exist = await this.followRepository.findOne({
      filter: { follower: user._id, following: target },
    });
    if (exist) throw new BadRequestException("You already follow this user");

    await this.followRepository.createOne({
      data: { follower: user._id, following: target },
    });
  }

  async unfollow(user: HydratedUser, targetId: string) {
    const result = await this.followRepository.deleteOne({
      filter: { follower: user._id, following: toObjectId(targetId) },
    });
    if (result.deletedCount === 0) throw new NotFoundException("You are not following this user");
  }

  async getFollowers(userId: string, { page, limit }: { page: number; limit: number }) {
    const id = toObjectId(userId);

    const [count, docs] = await Promise.all([
      this.followRepository.countDocuments({ filter: { following: id } }),
      this.followRepository.find({
        filter: { following: id },
        options: {
          populate: [{ path: "follower", select: "firstName lastName image" }],
          sort: { createdAt: -1 },
          skip: (page - 1) * limit,
          limit,
        },
      }),
    ]);
    return { count, page, limit, users: docs.map((d) => d.follower) };
  }

  async getFollowing(userId: string, { page, limit }: { page: number; limit: number }) {
    const id = toObjectId(userId);

    const [count, docs] = await Promise.all([
      this.followRepository.countDocuments({ filter: { follower: id } }),
      this.followRepository.find({
        filter: { follower: id },
        options: {
          populate: [{ path: "following", select: "firstName lastName image" }],
          sort: { createdAt: -1 },
          skip: (page - 1) * limit,
          limit,
        },
      }),
    ]);
    return { count, page, limit, users: docs.map((d) => d.following) };
  }
}

export const followService = new FollowService();