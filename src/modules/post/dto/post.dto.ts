import z from "zod";
import { createPostValidation } from "./../post.validation";

export type CreatePostDto = z.infer<ReturnType<typeof createPostValidation>>["body"];