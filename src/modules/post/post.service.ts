import { unlink } from "node:fs/promises";
import { BadRequestException } from "../../common/exception";
import { postRepository, PostRepository, UserRepository } from "../../common/repository";
import { tokenService, TokenService } from "../../common/service";
import { cacheService, CacheService } from "../../common/service/cache.service";
import { HydratedUser } from "../../model";
import { resolve } from "node:path";
import { CreatePostDto } from "./dto/post.dto";

const deleteImage = async (path: string) => {
  await unlink(resolve(`./${path}`)).catch(() => {});
};

export class PostService {
  private readonly tokenService: TokenService;
  private readonly userRepository: UserRepository;
  private readonly cacheService: CacheService;
  private readonly postRepository: PostRepository;

  constructor() {
    this.tokenService = tokenService;
    this.userRepository = new UserRepository();
    this.cacheService = cacheService;
    this.postRepository = postRepository;
  }

  async createPost(user: HydratedUser, { content }: CreatePostDto, file?: Express.Multer.File) {
    if (!content && !file) {
      throw new BadRequestException("Post must contain text or image");
    }

    const post = await this.postRepository.create({
      data: {
        author: user._id,
        content: content || undefined,
        image: file ? [file.path] : undefined,
      },
    });
    return post;
  }

  async getMyPosts(user: HydratedUser, { page, limit }: { page: number; limit: number }) {
    const result = await this.postRepository.paginate({
      filter: {
        author: user._id,
      },
      options: { sort: { createdAt: -1 } },
      page,
      limit,
    });

    return { count: result.count, limit, page, post: result.docs };
  }
}

export const postService = new PostService();