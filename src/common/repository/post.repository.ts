import { IPost, PostModel } from "../../model";
import { DatabaseRepository } from "./base.repository";

export class PostRepository extends DatabaseRepository<IPost> {
  constructor() {
    super(PostModel);
  }
}

export const postRepository = new PostRepository();