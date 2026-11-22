import { ConflictException, NotFoundException } from "../../common/exception";
import { UserRepository } from "../../common/repository";
import { cloudService, CloudService, JwtPayloadType } from "../../common/service";
import { ACCESS_TOKEN_EXPIRES_IN } from "../../config";
import { HydratedUser } from "../../model";
import { tokenService, TokenService } from "./../../common/service/token.service";
import { cacheService, CacheService } from "../../common/service/cache.service";
import { decryptionSecurity, encryptionSecurity } from "../../common/security";
import { toObjectId } from "../../common/utils";
import { SearchDto, UpdateProfileDto } from "./dto/user.dto";
import { IFile } from "../../common/types/express.types";
import { logoutEnum } from "../../common/enum";

const escapeRegex = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export class UserService {
  private readonly tokenService: TokenService;
  private readonly userRepository: UserRepository;
  private readonly cacheService: CacheService;
  private readonly cloudService: CloudService;

  constructor() {
    this.tokenService = tokenService;
    this.userRepository = new UserRepository();
    this.cacheService = cacheService;
    this.cloudService = cloudService;
  }

  async rotateTokenService(payload: JwtPayloadType, user: HydratedUser, issuer: string) {
    const expireAccessAt = (payload.iat + ACCESS_TOKEN_EXPIRES_IN) * 1000;
    const currentTime = Date.now() + 5 * 60000;
    if (currentTime < expireAccessAt) {
      const remaining = Math.ceil((expireAccessAt - Date.now()) / 1000);
      throw new ConflictException(`Sorry we cannot create new login credentials while current credentials still within valid time range ${remaining}s`);
    }
    const data = this.tokenService.createLoginCredentials({ user, issuer });
    await this.tokenService.createRevokeToken({ payload });
    return data;
  }

  async logoutService(payload: JwtPayloadType, user: HydratedUser, { action = logoutEnum.DEVICE }) {
    switch (action) {
      case logoutEnum.ALL:
        user.changeCredentialsTime = new Date();
        await user.save();
        await this.cacheService.del({
          key: await this.cacheService.keys({
            prefix: this.tokenService.userBaseRevokeTokenKey({ userId: payload.sub }),
          }),
        });
        break;

      default:
        await this.tokenService.createRevokeToken({ payload });
        break;
    }
    return;
  }

  async getProfile(user: HydratedUser) {
    return {
      _id: user._id,
      username: user.username,
      email: user.email,
      phone: user.phone ? await decryptionSecurity(user.phone) : undefined,
      gender: user.gender,
      DOB: user.DOB,
      image: user.image,
      coverImage: user.coverImage,
      provider: user.provider,
      createdAt: user.createdAt,
      isPrivate: user.isPrivate,
    };
  }

  async updateProfile(user: HydratedUser, { username, phone, gender, DOB }: UpdateProfileDto) {
    if (username !== undefined) user.username = username;
    if (phone !== undefined) user.phone = await encryptionSecurity(phone);
    if (gender !== undefined) user.gender = gender;
    if (DOB !== undefined) user.DOB = DOB.toISOString();

    await user.save();
    return this.getProfile(user);
  }

  async getUserProfile(userId: string) {
    const user = await this.userRepository.findById({ id: toObjectId(userId) });
    if (!user) throw new NotFoundException("User not found");

    return {
      _id: user._id,
      username: user.username,
      image: user.image,
      coverImage: user.coverImage,
      gender: user.gender,
      createdAt: user.createdAt?.toString(),
    };
  }

  async searchUsersService(user: HydratedUser, { q, page, limit }: SearchDto) {
    const regex = new RegExp(`^${escapeRegex(q)}`, "i");

    const filter = {
      _id: { $ne: user._id },
      confirmEmail: { $exists: true },
      $or: [{ firstName: regex }, { lastName: regex }],
    };

    const count = await this.userRepository.countDocuments({ filter });

    const users = await this.userRepository.find({
      filter,
      options: {
        select: "firstName lastName image",
        skip: (page - 1) * limit,
        limit,
      },
    });
    return { count, page, limit, users };
  }

  async privacyStatus(user: HydratedUser, { isPrivate }: { isPrivate: boolean }) {
    user.isPrivate = isPrivate;
    await user.save();
    return { isPrivate };
  }

  async profileImage(file: IFile, user: HydratedUser) {
    user.image = await this.cloudService.uploadAsset({ file, path: `User/${user._id.toString()}/profile` });
    await user.save();
    return user.toJSON();
  }
}

export const userService = new UserService();